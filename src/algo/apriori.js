/**
 * Main function implementing the Apriori algorithm.
 * @param {Array} transactionDatabase - The transaction database.
 * @param {number} minSup - The minimum support threshold.
 * @returns {Array} - An array containing frequent itemsets and their counts.
 */

export function apriori(D, minSup, minConf) {
    let L = [];
    let result = findFrequentOneItemsets(D, minSup);
    let L1 = result.firstItemSet;
    let allCounts = [result.counts]; // Include the counts from the first itemset
    L.push(L1);
    let k = 2;
    let allBeforePruningCk = [];
    let allAfterPruningCk = [];

    while (Array.isArray(L[k - 2]) && L[k - 2].length > 0) {
        let beforePruningCk, afterPruningCk;
        [beforePruningCk, afterPruningCk] = aprioriGen(L[k - 2]);
        allBeforePruningCk.push(beforePruningCk);
        allAfterPruningCk.push(afterPruningCk);

        const counts = countItemsets(afterPruningCk, D);
        allCounts.push(counts);

        let Lk = filterByMinSup(counts, minSup);
        L.push(Lk);
        k++;
    }
    const [allRules, filteredRules] = generateAssociationRules(L, allCounts, minConf);

    return [L, allCounts, allBeforePruningCk, allAfterPruningCk, allRules, filteredRules];
}



// return first itemSet <Unique items> and filter it by minSup
export function findFrequentOneItemsets(D, minSup) {
    let counts = {};

    for (let t of D) {
        for (let item of t) {
            counts[item] = (counts[item] || 0) + 1;
        }
    }
    const firstItemSet = Object.keys(counts).filter(item => counts[item] >= minSup)

    return { firstItemSet, counts };
}

function aprioriGen(Lk_1) {
    const newItemsetsBeforePruning = [];
    const newItemsetsAfterPruning = [];
    const len = Lk_1.length;

    for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
            const itemset1 = Lk_1[i].split(',');
            const itemset2 = Lk_1[j].split(',');

            // Check that all but the last elements of two itemsets are equal
            if (itemset1.slice(0, -1).join(',') === itemset2.slice(0, -1).join(',')) {
                // Combine the last elements of two itemsets if they are not the same
                if (itemset1.slice(-1) !== itemset2.slice(-1)) {
                    const newItemset = [...itemset1, itemset2.slice(-1)].sort();

                    // Collect new itemsets before pruning
                    newItemsetsBeforePruning.push(newItemset.join(','));

                    // Prune step: Check if all (k-1)-item subsets are in Lk_1
                    const subsets = getSubsets(newItemset, newItemset.length - 1);
                    const allSubsetsFrequent = subsets.every(subset =>
                        Lk_1.includes(subset.join(','))
                    );

                    if (allSubsetsFrequent) {
                        newItemsetsAfterPruning.push(newItemset.join(','));

                    }
                }
            }
        }
    }

    return [newItemsetsBeforePruning, newItemsetsAfterPruning];
}

// Helper function to get all k-item subsets of an itemset
function getSubsets(itemset, k) {
    if (k === 0) {
        return [[]];
    }

    if (itemset.length < k) {
        return [];
    }

    const [head, ...tail] = itemset;

    const subsetsWithoutHead = getSubsets(tail, k);
    const subsetsWithHead = getSubsets(tail, k - 1).map(subset => [head, ...subset]);

    return [...subsetsWithoutHead, ...subsetsWithHead];
}


export function countItemsets(Ck, D) {
    let counts = {};
    for (let c of Ck) {
        counts[c] = 0;
    }

    for (let t of D) {
        for (let c of Ck) {
            const items = c.split(',');
            if (items.every(item => t.includes(item))) {
                counts[c] = (counts[c] || 0) + 1;
            }
        }
    }

    return counts;
}


export function filterByMinSup(counts, minSup) {
    return Object.keys(counts)
        .filter(itemset => counts[itemset] >= minSup)
        .sort((a, b) => {
            const aItems = a.split(',').map(Number);
            const bItems = b.split(',').map(Number);

            for (let i = 0; i < aItems.length; i++) {
                if (aItems[i] !== bItems[i]) {
                    return aItems[i] - bItems[i];
                }
            }

            return 0;
        });
}


//

export function generateAssociationRules(L, allCounts, minConf) {
    const allRules = [];
    const filteredRules = [];
    const totalTransactions = allCounts[0].length;

    // Find the last non-empty array in L
    const lastNonEmptyIndex = L.reduce((acc, cur, idx) => (cur.length > 0 ? idx : acc), -1);

    const Lk = L[lastNonEmptyIndex];
    for (let freqItemset of Lk) {
        const itemset = freqItemset.split(',');
        const itemsetCount = allCounts[lastNonEmptyIndex][freqItemset];

        // Generate all non-empty subsets of itemset
        for (let r = 1; r < itemset.length; r++) {
            const allNonEmptySubsets = getSubsets(itemset, r);

            for (let antecedent of allNonEmptySubsets) {
                const consequent = itemset.filter(item => !antecedent.includes(item));
                const antecedentCount = allCounts[antecedent.length - 1][antecedent.join(',')];

                const confidence = itemsetCount / antecedentCount;

                const newRule = {
                    antecedent: antecedent,
                    consequent: consequent,
                    confidence: confidence,
                    support: itemsetCount / totalTransactions
                };

                allRules.push(newRule);

                if (confidence >= minConf / 100) {
                    filteredRules.push(newRule);
                }
            }
        }
    }

    return [allRules, filteredRules];
}

// D = [
//     ["1", "2", "5"],
//     ["2", "4"],
//     ["2", "3"],
//     ["1", "2", "4"],
//     ["1", "3"],
//     ["2", "3"],
//     ["1", "3"],
//     ["1", "2", "3", "5"],
//     ["1", "2", "3"],
// ]

// minSup = 2

// apriori(D, minSup)
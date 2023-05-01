import { useState } from "react";
import TransactionForm from "./components/transactionForm";
import { apriori, countItemsets, filterByMinSup, findFrequentOneItemsets } from '../algo/apriori';


export default function Home() {
  const [result, setResult] = useState();
  // 
  const [minSup, setMinSup] = useState(0);
  const [minConf, setMinConf] = useState(0);
  const [results, setResults] = useState([]);
  const [steps, setSteps] = useState([]);
  // for display:
  const [allCounts, setAllcounts] = useState(null);
  const [beforePruningCk, setBeforePruningCk] = useState(null);
  const [afterPruningCk, setAfterPruningCk] = useState(null);
  const [allRules, setAllRules] = useState(null);

  const handleMinSupChange = (e) => setMinSup(e.target.value);

  const handleMinConfChange = (event) => {
    setMinConf(event.target.value);
  };

  const runApriori = () => {
    const parsedDataset = result;
    const minSupInt = parseInt(minSup, 10);
    const [aprioriResults, Counts, beforePruningCk, afterPruningCk, ARules, FRules] = apriori(parsedDataset, minSupInt, minConf);
    //
    setAllcounts(Counts);
    setBeforePruningCk(beforePruningCk);
    setAfterPruningCk(afterPruningCk);
    setResults(aprioriResults);
    setAllRules(ARules);
    setFilteredRules(FRules);
    // Display steps
    let candidates = findFrequentOneItemsets(parsedDataset, minSupInt);
    let stepResults = [];
    while (Object.keys(candidates).length > 0) {
      const frequentItemsets = filterByMinSup(candidates, minSupInt);
      stepResults.push({ candidates, frequentItemsets });
      candidates = countItemsets(Object.keys(frequentItemsets), parsedDataset);
    }
    setSteps(stepResults);
  };

  return (
    <div className="p-8 text-black h-screen">
      <div className="flex">
        <div className="w-9/12">
          <TransactionForm setResult={setResult} />
        </div>
        <div className="w-2/5 h-80">
          <h2 className="mb-4 text-xl font-bold">Transaction :</h2>
          {result && (
            <div className="mt-8 h-full overflow-scroll">
              {result.map((arr, index) => (
                <div key={index}>{JSON.stringify(arr, null, 4)}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="divider"></div>

      <div className="flex gap-16">
        <div className="flex gap-4">
          <label className="flex items-center mb-4">
            <span className="mr-2">Minimum Support : </span>
            <input
              type="number"
              value={minSup}
              min={0}
              max={100}
              onChange={handleMinSupChange}
              className="w-20 input input-bordered input-sm outline-none"
            />
          </label>
          <label className="flex items-center mb-4">
            <span className="mr-2">Minimum Confidence : </span>
            <input
              type="number"
              value={minConf}
              min={0}
              max={100}
              onChange={handleMinConfChange}
              className="w-20 input input-bordered input-sm outline-none"
            />
          </label>
        </div>
        <button onClick={runApriori} className="mb-4 btn btn-accent">
          Run Apriori
        </button>
      </div>
      <h2 className="mb-2 text-xl font-semibold">Steps</h2>
      <div className="flex gap-4">
        {['allCounts', 'results', 'beforePruningCk', 'afterPruningCk'].map((dataKey, dataIndex) => (
          <div key={dataIndex} className="flex flex-col w-3/12 gap-10">
            {[allCounts, results, beforePruningCk, afterPruningCk][dataIndex]?.map((levelCounts, levelIndex) => {
              // Check if the levelCounts object is empty
              // const isLevelCountsEmpty = Object.keys(levelCounts).length === 0;
              const isLevelCountsEmpty = dataKey !== 'afterPruningCk' && Object.keys(levelCounts).length === 0;

              return (
                !isLevelCountsEmpty && (
                  <div key={levelIndex} className="flex flex-col">
                    <h4 className="mb-1 font-semibold">
                      {dataKey === 'allCounts' && `Counts - Level ${levelIndex + 1}`}
                      {dataKey === 'beforePruningCk' && `After Joining - Level ${levelIndex + 1}`}
                      {dataKey === 'afterPruningCk' && `After Pruning - Level ${levelIndex + 1}`}
                      {dataKey === 'results' && `After Min Support - Level ${levelIndex + 1}`}
                    </h4>
                    <div className="overflow-y-scroll min-h-table h-80">
                      <table className="table w-full table-compact flex-1 ">
                        <thead>
                          <tr>
                            {dataKey === 'allCounts' && <th>Itemset</th>}
                            {dataKey === 'allCounts' ? <th>Count</th> : <th>Itemset</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(levelCounts).map(([key, value], index) => (
                            <tr key={index}>
                              {dataKey === 'allCounts' && <td>{key.toString()}</td>}
                              {dataKey != 'allCounts' ? <td>{index + 1} - {value}</td> : <td> {value}</td>}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )
              );
            })}
          </div>
        ))}
      </div>

      <div className="divider"></div>

      <h2 className="mb-2 text-xl font-semibold">Results</h2>
      <ul className="mb-4 list-disc list-inside">
        {results.map((result, index) => (

          <li key={index}>L{index + 1} : {result.join(' - ')}</li>
        ))}
      </ul>

      <div className="divider"></div>

      {allRules && (
        <>
          <h2 className="my-5 text-xl font-semibold">Rules : </h2>
          <table className="table w-full table-zebra">
            <thead>
              <tr>
                <th>Antecedent</th>
                <th>Consequent</th>
                <th>Confidence Value</th>
                <th>Valid</th>
              </tr>
            </thead>
            <tbody>
              {allRules?.map((item, index) => (
                <tr key={index}>
                  <td>{item.antecedent.join(', ')}</td>
                  <td>{item.consequent.join(', ')}</td>
                  <td>{(item.confidence * 100).toFixed(1)} %</td>
                  <td>
                    {item.confidence > (minConf / 100) ? (
                      <span className="text-green-500 text-3xl">✓</span>
                    ) : (
                      <span className="text-red-500 text-3xl">×</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )
      }
    </div>
  );
}


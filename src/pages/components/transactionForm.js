"use client";

import { useState } from "react";
import ImportCvs from "./importCsv";

export default function TransactionForm({ setResult }) {
  const [transactions, setTransactions] = useState([[""]]);

  const handleChange = (e, i, j) => {
    const newTransactions = [...transactions];
    newTransactions[i][j] = e.target.value;
    setTransactions(newTransactions);
  };

  const addTransactionInput = (i) => {
    const newTransactions = [...transactions];
    newTransactions[i].push("");
    setTransactions(newTransactions);
  };

  const addTransaction = () => {
    setTransactions([...transactions, [""]]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Process the transactions as needed
    setResult(transactions);
  };

  return (
    <div className="container px-4 py-8 mx-auto">
      <h1 className="mb-6 text-2xl font-bold">Enter Transactions</h1>
      <form onSubmit={handleSubmit}>
        {transactions.map((transaction, i) => (
          <div key={i} className="mb-4">
            <div className="flex space-x-4">
              {transaction.map((item, j) => (
                <input
                  key={j}
                  type="text"
                  value={item}
                  onChange={(e) => handleChange(e, i, j)}
                  className="w-20 p-2 border border-gray-300 rounded-md shadow-sm"
                  placeholder={`Item ${j + 1}`}
                />
              ))}
              <button
                type="button"
                onClick={() => addTransactionInput(i)}
                className="text-white  rounded-full shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-primary "
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 6v12m6-6H6"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addTransaction}
          className="p-2 mb-4 btn-success text-black rounded-full shadow-sm"
        >
          Add Transaction
        </button>
        <br />
        <button
          type="submit"
          className="btn-accent btn btn-xs shadow-sm"
        >
          Submit
        </button>
      </form>
      <div className="divider w-48">OR</div>
      <ImportCvs setResult={setResult} />
      <div className="divider"></div>
    </div>
  );
}

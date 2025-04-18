import React, { useState, useEffect } from "react";
import "./home.css";
import { BsPlusCircleFill } from "react-icons/bs";
import { useHistory } from "react-router-dom";
import { IoChevronBack } from "react-icons/io5";
import { transactionsAPI } from "../services/api";
import { BsPiggyBank } from "react-icons/bs";
import { FaExchangeAlt } from "react-icons/fa";
import { RiUserReceived2Line } from "react-icons/ri";
import Balances from "./components/Balances";

const USER_MAPPING = {
  U06THFFTYFP: "ducnc",
  U06EV6EU1S9: "duongmn",
  U041R1SNZJA: "ductx",
  U07ETRJR2N6: "kienvt",
  U07GQGYU108: "anhnct",
  U04AH6KUFQX: "hoangl",
  U05GA1NS85S: "quangdd",
  U05P216BE7M: "tungnt",
  U03JHB3PPHV: "vinhnd",
  U03KMMTV2M6: "cuongnd",
  U05SU27E945: "thuyvm",
  U04GTSC0N9K: "anhhtl",
  U05J45E55NV: "thaind",
  U04CTAKLJ31: "hoaint",
  U05BZQ4V823: "ducpv",
  U04LYRLU98D: "chungnt",
  U071NBF45NK: "anhnh",
  U05NN7YD8RH: "hienhtt",
  U03GD0N9U5B: "kienbm",
  U04CTADDW23: "hoangdx",
  U03GKEEE5J6: "trangvm",
  U03D4UMTG5N: "davis",
  U080RBL3S6A: "genaibot",
};

const formatMoney = (amount) => {
  return new Intl.NumberFormat("vi-VN").format(amount);
};

function TransactionItem({ transaction }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      className="d-flex align-items-center justify-content-between p-3 mb-2"
      style={{
        backgroundColor: "#2a2a2a",
        borderRadius: "10px",
        margin: "10px",
        cursor: "pointer",
      }}
    >
      <div className="d-flex flex-column">
        <div className="d-flex align-items-center">
          <div
            style={{
              width: "40px",
              height: "40px",
              backgroundColor: "#4a4a4a",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "15px",
            }}
          >
            💰
          </div>
          <div>
            <h6 className="mb-0" style={{ color: "#fff" }}>
              {transaction.update_description}
            </h6>
            <small style={{ color: "#9ec0e5" }}>
              {formatDate(transaction.created_at)}
            </small>
          </div>
        </div>
      </div>
      <div className="text-end">
        <h6
          className="mb-0 d-flex align-items-center justify-content-end"
          style={{ color: "#67e9a9" }}
        >
          {formatMoney(transaction.total_amount)}{" "}
          <span style={{ marginLeft: "4px", fontSize: "1.2rem" }}>🐟</span>
        </h6>
        <small style={{ color: "#9ec0e5" }}>
          Paid by:{" "}
          {USER_MAPPING[transaction.creditor_id] || transaction.creditor_id}
        </small>
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="d-flex justify-content-center align-items-center my-3">
      <button
        className="btn btn-dark mx-2"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
      <span className="mx-3" style={{ color: "#9ec0e5" }}>
        Page {currentPage} of {totalPages}
      </span>
      <button
        className="btn btn-dark mx-2"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
}

function Home() {
  const history = useHistory();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentTab, setCurrentTab] = useState(1);
  const [splitData, setSplitData] = useState(null);
  const PAGE_SIZE = 10;

  const fetchTransactions = async (page) => {
    try {
      setLoading(true);
      const response = await transactionsAPI.getTransactions({
        purpose: "expense",
        page_number: page,
        page_size: PAGE_SIZE,
      });

      const { data } = response.data;
      setTransactions(data.data);
      setTotalPages(Math.ceil(data.total_count / PAGE_SIZE));
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchTransactions(newPage);
  };

  const fetchDebts = async () => {
    try {
      setLoading(true);
      const response = await transactionsAPI.calculateDebts();
      const { debts } = response.data.data;

      // Transform data for Balances component
      const splitData = {
        balances: {},
        participants: [],
        expenses: transactions.map((t) => ({
          ...t,
          amount: t.total_amount,
          paidBy: t.creditor_id,
        })),
        reimbursement: [],
        userMapping: USER_MAPPING, // Add user mapping to splitData
      };

      // Extract unique participants and initialize balances
      const participants = new Set();
      debts.forEach((debt) => {
        participants.add(debt.payer);
        participants.add(debt.payee);
      });

      splitData.participants = Array.from(participants);

      // Calculate balances
      splitData.participants.forEach((participant) => {
        let balance = 0;
        debts.forEach((debt) => {
          if (debt.payer === participant) {
            balance -= debt.amount;
          }
          if (debt.payee === participant) {
            balance += debt.amount;
          }
        });
        splitData.balances[participant] = balance;
      });

      setSplitData(splitData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentTab === 1) {
      fetchTransactions(currentPage);
    } else if (currentTab === 2) {
      fetchDebts();
    }
  }, [currentTab]);

  if (!localStorage.getItem("token")) {
    history.push("/signin");
    return null;
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="d-flex justify-content-center flex-column p-0 align-items-start"
        style={{
          width: "100vw",
          backgroundColor: "#1a1a1a",
        }}
      >
        <div className="d-flex w-100 px-4 align-items-center justify-content-between">
          <div className="d-flex py-3 align-items-center">
            <IoChevronBack
              onClick={() => history.goBack()}
              style={{ fontSize: "2.5rem", color: "#9ec0e5" }}
            />
            <h2 className="mont mx-4 display-6">Transactions</h2>
          </div>
        </div>
        <div className="mt-3 w-100 d-flex justify-content-around">
          <div
            style={{
              borderBottom: currentTab === 1 ? "2px solid #cb2727" : undefined,
            }}
            className="d-flex flex-column align-items-center"
            onClick={() => setCurrentTab(1)}
          >
            <BsPiggyBank style={{ fontSize: "2rem" }} />
            <p className="">Expenses</p>
          </div>
          <div
            style={{
              borderBottom: currentTab === 2 ? "2px solid #ffffff" : undefined,
            }}
            className="d-flex flex-column align-items-center"
            onClick={() => setCurrentTab(2)}
          >
            <FaExchangeAlt style={{ fontSize: "2rem" }} />
            <p className="">Balances</p>
          </div>
          <div
            style={{
              borderBottom: currentTab === 3 ? "2px solid #89e289" : undefined,
            }}
            className="d-flex flex-column align-items-center"
            onClick={() => setCurrentTab(3)}
          >
            <RiUserReceived2Line style={{ fontSize: "2rem" }} />
            <p className="">Mine</p>
          </div>
        </div>
      </div>

      <div style={{ flexGrow: "1", overflowY: "auto" }}>
        {error && (
          <div className="text-danger text-center mt-3">Error: {error}</div>
        )}

        {currentTab === 1 && (
          <div className="p-3">
            {transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
            {loading && <div className="text-center my-3">Loading...</div>}
            {!loading && transactions.length === 0 && (
              <div className="text-center my-3">No transactions found</div>
            )}
            {!loading && transactions.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        )}

        {currentTab === 2 && (
          <>
            {loading && <div className="text-center my-3">Loading...</div>}
            {!loading && splitData && (
              <div className="p-3">
                <Balances
                  split={splitData}
                  documentID="temp-id"
                  setSplit={setSplitData}
                />
              </div>
            )}
          </>
        )}

        {currentTab === 3 && (
          <div className="text-center my-3">Mine tab content</div>
        )}
      </div>

      <BsPlusCircleFill
        className="button"
        onClick={() => history.push("/new-transaction")}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          fontSize: "3rem",
          color: "#9ec0e5",
          cursor: "pointer",
        }}
      />
    </div>
  );
}

export default Home;

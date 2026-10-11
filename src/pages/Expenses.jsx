import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";

const categories = [
  "Feed",
  "Labour",
  "Electricity",
  "Water",
  "Medicine",
  "Vaccination",
  "Transportation",
  "Packaging",
  "Maintenance",
  "Rent",
  "Other",
];

function today() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createExpense() {
  return {
    rowId: `${Date.now()}-${Math.random()}`,
    expenseDate: today(),
    expenseType: "Feed",
    amount: "",
    description: "",
  };
}

const money = (amount) =>
  `₹${Number(amount || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function Expenses() {
  const [rows, setRows] = useState([]);
  const [entries, setEntries] = useState([createExpense()]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadExpenses() {
    try {
      const data = await api.expenses.list();
      setRows(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.message || "Unable to load expenses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadExpenses();
  }, []);

  // Update one expense row
  function updateEntry(rowId, field, value) {
    setEntries((current) =>
      current.map((entry) =>
        entry.rowId === rowId
          ? { ...entry, [field]: value }
          : entry
      )
    );
  }

  // Add another expense
  function addExpense() {
    setEntries((current) => [...current, createExpense()]);
    setError("");
    setMessage("");
  }

  // Remove a row from the form
  function removeEntry(rowId) {
    setEntries((current) =>
      current.length === 1
        ? [createExpense()]
        : current.filter((entry) => entry.rowId !== rowId)
    );
  }

  // Calculate the total of all new expense rows
  const newTotal = useMemo(
    () =>
      entries.reduce(
        (sum, entry) => sum + Number(entry.amount || 0),
        0
      ),
    [entries]
  );

  // Calculate the total of saved expenses
  const savedTotal = rows.reduce(
    (sum, row) => sum + Number(row.amount || 0),
    0
  );

  // Search saved expenses
  const filteredRows = useMemo(() => {
    const query = search.toLowerCase();

    return rows.filter((row) =>
      `${row.expenseDate || ""} ${row.expenseType || ""} ${
        row.description || ""
      }`
        .toLowerCase()
        .includes(query)
    );
  }, [rows, search]);

  // Save every expense as a separate database record
  async function saveAll(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      if (!entry.expenseDate || !entry.expenseType) {
        setError(`Please complete the date and category for expense ${i + 1}.`);
        return;
      }

      if (
        entry.amount === "" ||
        !Number.isFinite(Number(entry.amount)) ||
        Number(entry.amount) <= 0
      ) {
        setError(`Enter a valid amount greater than zero for expense ${i + 1}.`);
        return;
      }
    }

    setSaving(true);
    let savedCount = 0;

    try {
      for (const entry of entries) {
        await api.expenses.create({
          expenseDate: entry.expenseDate,
          expenseType: entry.expenseType,
          amount: Number(entry.amount),
          description: entry.description.trim(),
        });

        savedCount++;
      }

      setMessage(`${savedCount} expense(s) saved successfully.`);
      setEntries([createExpense()]);
      await loadExpenses();
    } catch (err) {
      setError(
        `${err.message || "Unable to save expenses."} ${
          savedCount > 0
            ? `${savedCount} expense(s) were saved before the error. Check the history before retrying.`
            : ""
        }`
      );
      await loadExpenses();
    } finally {
      setSaving(false);
    }
  }

  // Delete a saved expense
  async function removeExpense(id) {
    if (!window.confirm("Do you want to delete this expense?")) {
      return;
    }

    try {
      setError("");
      setMessage("");

      await api.expenses.remove(id);
      await loadExpenses();

      setMessage("Expense deleted successfully.");
    } catch (err) {
      setError(err.message || "Unable to delete expense.");
    }
  }

  return (
    <div>
      <div className="section-head">
        <div>
          <h2>Expense management</h2>
          <p className="muted">
            Add multiple farm expenses and track your total spending.
          </p>
        </div>
      </div>

      {error && <div className="alert error">{error}</div>}
      {message && <div className="alert success">{message}</div>}

      <div className="two-col">
        {/* ADD MULTIPLE EXPENSES */}
        <form className="panel form-panel" onSubmit={saveAll}>
          <div className="panel-head">
            <div>
              <h3>Add multiple expenses</h3>
              <p className="muted">
                Enter all expenses before saving.
              </p>
            </div>
          </div>

          {entries.map((entry, index) => (
            <div className="expense-entry" key={entry.rowId}>
              <div className="expense-entry-head">
                <strong>Expense #{index + 1}</strong>

                <button
                  type="button"
                  className="remove-row-btn"
                  onClick={() => removeEntry(entry.rowId)}
                  disabled={saving}
                >
                  Remove
                </button>
              </div>

              <div className="form-grid">
                <Field label="Date">
                  <input
                    className="input"
                    type="date"
                    value={entry.expenseDate}
                    onChange={(e) =>
                      updateEntry(entry.rowId, "expenseDate", e.target.value)
                    }
                    required
                  />
                </Field>

                <Field label="Expense category">
                  <select
                    className="input"
                    value={entry.expenseType}
                    onChange={(e) =>
                      updateEntry(entry.rowId, "expenseType", e.target.value)
                    }
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Amount (₹)">
                <input
                  className="input"
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Enter amount"
                  value={entry.amount}
                  onChange={(e) =>
                    updateEntry(entry.rowId, "amount", e.target.value)
                  }
                  required
                />
              </Field>

              <Field label="Description">
                <input
                  className="input"
                  type="text"
                  placeholder="Example: Feed purchased for the farm"
                  value={entry.description}
                  onChange={(e) =>
                    updateEntry(entry.rowId, "description", e.target.value)
                  }
                />
              </Field>
            </div>
          ))}

          <button
            type="button"
            className="secondary-btn full"
            onClick={addExpense}
            disabled={saving}
          >
            + Add another expense
          </button>

          <div className="calc-box">
            <div className="summary-row strong">
              <span>Total new expenses</span>
              <b>{money(newTotal)}</b>
            </div>

            <p className="muted">
              Number of entries: {entries.length}
            </p>
          </div>

          <button
            className="primary-btn full"
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving expenses..."
              : `Save ${entries.length} expense(s)`}
          </button>
        </form>

        {/* SAVED EXPENSE HISTORY */}
        <div className="panel">
          <div className="panel-head">
            <div>
              <h3>Expense history</h3>
              <p className="muted">
                Total recorded: {money(savedTotal)}
              </p>
            </div>

            <input
              className="search"
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <p className="muted">Loading expenses...</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((row) => (
                    <tr key={row.id}>
                      <td>{row.expenseDate}</td>
                      <td>
                        <span className="expense-category">
                          {row.expenseType}
                        </span>
                      </td>
                      <td>{row.description || "-"}</td>
                      <td>{money(row.amount)}</td>
                      <td>
                        <button
                          type="button"
                          className="table-btn danger-text"
                          onClick={() => removeExpense(row.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredRows.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty">
                        No expenses found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="field">
      <label>{label}</label>
      {children}
    </div>
  );
}
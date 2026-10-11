import React, {
  useEffect,
  useState,
} from 'react';

import { api } from '../api';

const blank = {
  incomeDate: new Date()
    .toISOString()
    .slice(0, 10),

  incomeType:
    'Other Poultry Income',

  amount: '',
  description: '',
};

const money = (n) =>
  `₹${Number(n || 0).toLocaleString(
    'en-IN',
    {
      maximumFractionDigits: 2,
    }
  )}`;

export default function Income() {

  const [rows, setRows] =
    useState([]);

  const [form, setForm] =
    useState(blank);

  const [error, setError] =
    useState('');

  const load = () =>
    api.income
      .list()
      .then(setRows)
      .catch((e) =>
        setError(e.message)
      );

  useEffect(() => {
    load();
  }, []);

  const save = async (e) => {

    e.preventDefault();

    try {

      await api.income.create({
        ...form,
        amount: Number(form.amount),
      });

      setForm(blank);

      load();

    } catch (e) {

      setError(e.message);

    }
  };

  const remove = async (id) => {

    if (
      !window.confirm(
        'Delete this income?'
      )
    ) {
      return;
    }

    try {

      await api.income.remove(id);

      load();

    } catch (e) {

      setError(e.message);

    }
  };

  const total = rows.reduce(
    (sum, row) =>
      sum + Number(row.amount || 0),
    0
  );

  return (
    <div>

      <div className="section-head">

        <div>

          <h2>
            Income management
          </h2>

          <p className="muted">
            Track non-sale income and
            other poultry revenue.
          </p>

        </div>

      </div>

      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      <div className="two-col">

        <form
          className="panel form-panel"
          onSubmit={save}
        >

          <h3>
            Add income
          </h3>

          <Field label="Date">

            <input
              className="input"
              type="date"
              value={form.incomeDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  incomeDate:
                    e.target.value,
                })
              }
            />

          </Field>

          <Field label="Income type">

            <select
              className="input"
              value={form.incomeType}
              onChange={(e) =>
                setForm({
                  ...form,
                  incomeType:
                    e.target.value,
                })
              }
            >

              <option>
                Other Poultry Income
              </option>

              <option>
                Chicken Sales
              </option>

              <option>
                Manure Sales
              </option>

              <option>
                Other
              </option>

            </select>

          </Field>

          <Field label="Amount">

            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              value={form.amount}
              onChange={(e) =>
                setForm({
                  ...form,
                  amount:
                    e.target.value,
                })
              }
              required
            />

          </Field>

          <Field label="Description">

            <textarea
              className="input textarea"
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description:
                    e.target.value,
                })
              }
            />

          </Field>

          <button className="primary-btn full">
            Save income
          </button>

        </form>

        <div className="panel">

          <div className="panel-head">

            <div>

              <h3>
                Income history
              </h3>

              <p className="muted">
                Total: {money(total)}
              </p>

            </div>

          </div>

          <div className="table-wrap">

            <table>

              <thead>

                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th />
                </tr>

              </thead>

              <tbody>

                {rows.map((row) => (

                  <tr key={row.id}>

                    <td>
                      {row.incomeDate}
                    </td>

                    <td>
                      {row.incomeType}
                    </td>

                    <td>
                      {row.description || '-'}
                    </td>

                    <td>
                      {money(row.amount)}
                    </td>

                    <td>

                      <button
                        className="table-btn danger-text"
                        onClick={() =>
                          remove(row.id)
                        }
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))}

                {rows.length === 0 && (
                  <tr>

                    <td
                      colSpan="5"
                      className="empty"
                    >
                      No income records found.
                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>
  );
}

function Field({
  label,
  children,
}) {

  return (
    <div className="field">

      <label>
        {label}
      </label>

      {children}

    </div>
  );
}
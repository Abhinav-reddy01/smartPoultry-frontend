import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';

import { api } from '../api';

const money = (n) =>
  `₹${Number(n || 0).toLocaleString(
    'en-IN',
    {
      maximumFractionDigits: 2,
    }
  )}`;

const empty = {
  customerId: '',
  saleDate: new Date()
    .toISOString()
    .slice(0, 10),

  eggsSold: '',
  pricePerEgg: '',
  taxRate: '0',
  paymentStatus: 'PENDING',
};

export default function Sales() {

  const [sales, setSales] = useState([]);
  const [customers, setCustomers] =
    useState([]);

  const [form, setForm] =
    useState(empty);

  const [search, setSearch] =
    useState('');

  const [error, setError] =
    useState('');

  const [saving, setSaving] =
    useState(false);

  const load = async () => {

    try {

      setSales(
        await api.sales.list() || []
      );

      setCustomers(
        await api.customers.list() || []
      );

    } catch (e) {

      setError(e.message);

    }
  };

  useEffect(() => {
    load();
  }, []);

  const subtotal =
    Number(form.eggsSold || 0) *
    Number(form.pricePerEgg || 0);

  const tax =
    subtotal *
    Number(form.taxRate || 0) /
    100;

  const total =
    subtotal + tax;

  const filtered = useMemo(
    () =>
      sales.filter((sale) =>
        `${sale.saleDate}
         ${sale.paymentStatus}
         ${sale.customerId}`
          .toLowerCase()
          .includes(
            search.toLowerCase()
          )
      ),
    [sales, search]
  );

  const save = async (e) => {

    e.preventDefault();

    setError('');

    if (
      !form.customerId ||
      !form.eggsSold ||
      !form.pricePerEgg
    ) {

      setError(
        'Customer, eggs sold and price per egg are required.'
      );

      return;
    }

    setSaving(true);

    try {

      await api.sales.create({

        ...form,

        customerId: form.customerId,

        eggsSold:
          Number(form.eggsSold),

        pricePerEgg:
          Number(form.pricePerEgg),

        taxRate:
          Number(form.taxRate || 0),

      });

      setForm(empty);

      await load();

    } catch (e) {

      setError(e.message);

    } finally {

      setSaving(false);

    }
  };

  return (
    <div>

      <div className="section-head">

        <div>

          <h2>
            Daily egg sales
          </h2>

          <p className="muted">
            Record every sale and automatically
            calculate subtotal, tax and invoice total.
          </p>

        </div>

      </div>

      {error && (
        <div className="alert error">
          {error}
        </div>
      )}

      <div className="two-col sales-layout">

        <form
          className="panel form-panel"
          onSubmit={save}
        >

          <div className="panel-head">

            <div>

              <h3>
                New egg sale
              </h3>

              <p className="muted">
                Enter transaction details.
              </p>

            </div>

          </div>

          <Field label="Sale date">

            <input
              className="input"
              type="date"
              value={form.saleDate}
              onChange={(e) =>
                setForm({
                  ...form,
                  saleDate: e.target.value,
                })
              }
            />

          </Field>

          <Field label="Customer">

            <select
              className="input"
              value={form.customerId}
              onChange={(e) =>
                setForm({
                  ...form,
                  customerId:
                    e.target.value,
                })
              }
            >

              <option value="">
                Select customer
              </option>

              {customers.map(
                (customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.name}
                  </option>
                )
              )}

            </select>

          </Field>

          <div className="form-grid">

            <Field label="Eggs sold">

              <input
                className="input"
                type="number"
                min="1"
                value={form.eggsSold}
                onChange={(e) =>
                  setForm({
                    ...form,
                    eggsSold:
                      e.target.value,
                  })
                }
              />

            </Field>

            <Field label="Price per egg">

              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={form.pricePerEgg}
                onChange={(e) =>
                  setForm({
                    ...form,
                    pricePerEgg:
                      e.target.value,
                  })
                }
              />

            </Field>

          </div>

          <div className="form-grid">

            <Field label="Tax rate %">

              <input
                className="input"
                type="number"
                min="0"
                step="0.01"
                value={form.taxRate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    taxRate:
                      e.target.value,
                  })
                }
              />

            </Field>

            <Field label="Payment status">

              <select
                className="input"
                value={form.paymentStatus}
                onChange={(e) =>
                  setForm({
                    ...form,
                    paymentStatus:
                      e.target.value,
                  })
                }
              >

                <option>
                  PAID
                </option>

                <option>
                  PARTIAL
                </option>

                <option>
                  PENDING
                </option>

              </select>

            </Field>

          </div>

          <div className="calc-box">

            <SummaryRow
              label="Subtotal"
              value={money(subtotal)}
            />

            <SummaryRow
              label={`Tax (${form.taxRate || 0}%)`}
              value={money(tax)}
            />

            <SummaryRow
              label="Invoice total"
              value={money(total)}
              strong
            />

          </div>

          <button
            className="primary-btn full"
            disabled={saving}
          >
            {saving
              ? 'Saving...'
              : 'Save egg sale'}
          </button>

        </form>

        <div className="panel">

          <div className="panel-head">

            <div>

              <h3>
                Sales history
              </h3>

              <p className="muted">
                All recorded egg sale transactions.
              </p>

            </div>

            <input
              className="search"
              placeholder="Search sales..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />

          </div>

          <div className="table-wrap">

            <table>

              <thead>

                <tr>
                  <th>Date</th>
                  <th>Customer ID</th>
                  <th>Eggs</th>
                  <th>Rate</th>
                  <th>Total</th>
                  <th>Payment</th>
                </tr>

              </thead>

              <tbody>

                {filtered.map((sale) => (

                  <tr key={sale.id}>

                    <td>
                      {sale.saleDate}
                    </td>

                    <td>
                      {sale.customerId}
                    </td>

                    <td>
                      {Number(
                        sale.eggsSold
                      ).toLocaleString(
                        'en-IN'
                      )}
                    </td>

                    <td>
                      {money(
                        sale.pricePerEgg
                      )}
                    </td>

                    <td>
                      {money(
                        sale.totalAmount
                      )}
                    </td>

                    <td>

                      <span
                        className={`badge ${
                          String(
                            sale.paymentStatus
                          ).toLowerCase()
                        }`}
                      >
                        {sale.paymentStatus}
                      </span>

                    </td>

                  </tr>

                ))}

                {filtered.length === 0 && (
                  <tr>

                    <td
                      colSpan="6"
                      className="empty"
                    >
                      No sales found.
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
      <label>{label}</label>
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
}) {

  return (
    <div
      className={`summary-row ${
        strong ? 'strong' : ''
      }`}
    >

      <span>
        {label}
      </span>

      <b>
        {value}
      </b>

    </div>
  );
}
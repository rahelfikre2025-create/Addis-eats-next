"use client";

import { useState } from "react";
import Link from "next/link";
import { ORDER_STATUSES } from "../lib/order-status";

const MAX_SEARCH_LENGTH = 100;

export default function OrderFilters({ sort, dir, filters }) {
  const [search, setSearch] = useState(filters.q);

  return (
    <section
      aria-label="Order search and filters"
      className="content-card orders-filters-card"
    >
      <form
        action="/orders"
        method="get"
        className="orders-filter-form grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <input type="hidden" name="sort" value={sort} />
        <input type="hidden" name="dir" value={dir} />
        <input type="hidden" name="page" value="1" />

        <div className="field-group">
          <label htmlFor="order-search">Search orders or customers</label>
          <input
            id="order-search"
            name="q"
            type="search"
            maxLength={MAX_SEARCH_LENGTH}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Order ID, name, or phone"
          />
        </div>

        <div className="field-group">
          <label htmlFor="order-status">Status</label>
          <select id="order-status" name="status" defaultValue={filters.status}>
            <option value="">All statuses</option>
            {ORDER_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="field-group">
          <label htmlFor="order-start-date">Start date</label>
          <input
            id="order-start-date"
            name="start"
            type="date"
            defaultValue={filters.start}
          />
        </div>

        <div className="field-group">
          <label htmlFor="order-end-date">End date</label>
          <input
            id="order-end-date"
            name="end"
            type="date"
            defaultValue={filters.end}
          />
        </div>

        <div className="orders-filter-actions flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-4">
          <button type="submit" className="primary-button">
            Apply filters
          </button>
          <Link href="/orders" className="rounded-lg border px-4 py-2">
            Clear filters
          </Link>
          <p className="text-sm text-gray-600">
            Date boundaries are inclusive Addis Ababa calendar dates.
          </p>
        </div>
      </form>
    </section>
  );
}

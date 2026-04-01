import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { MinusCircle, PlusCircle } from "lucide-react";
import { api } from "../lib/api";
import type { SaleRecord } from "../types";

type FormValues = Omit<SaleRecord, "id" | "createdAt" | "updatedAt">;

const emptySale: FormValues = {
  customerName: "",
  seller: "",
  saleDate: new Date().toISOString().slice(0, 10),
  address: "",
  city: "",
  state: "India",
  totalPrice: 0,
  latitude: null,
  longitude: null,
  notes: "",
  tables: [{ tableName: "", type: "", size: "", quantity: 1, unitPrice: 0, features: "" }],
};

export function SaleFormPage({ mode }: { mode: "create" | "edit" }) {
  const navigate = useNavigate();
  const params = useParams();
  const queryClient = useQueryClient();
  const saleQuery = useQuery({
    queryKey: ["sale", params.id],
    queryFn: () => api.sale(params.id!),
    enabled: mode === "edit" && Boolean(params.id),
  });
  const optionsQuery = useQuery({
    queryKey: ["options"],
    queryFn: api.options,
  });

  const values = useMemo(
    () => (mode === "edit" && saleQuery.data ? saleQuery.data : emptySale),
    [mode, saleQuery.data],
  );

  const form = useForm<FormValues>({ values });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tables",
  });

  const mutation = useMutation({
    mutationFn: async (payload: FormValues) => {
      if (mode === "edit" && params.id) return api.updateSale(params.id, payload);
      return api.createSale(payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sales"] }),
        queryClient.invalidateQueries({ queryKey: ["analytics"] }),
        queryClient.invalidateQueries({ queryKey: ["options"] }),
      ]);
      navigate("/records");
    },
  });

  const tables = form.watch("tables");
  const computedTotal = tables.reduce(
    (sum, table) => sum + Number(table.quantity || 0) * Number(table.unitPrice || 0),
    0,
  );

  return (
    <form
      className="page-stack"
      onSubmit={form.handleSubmit((payload) =>
        mutation.mutate({
          ...payload,
          totalPrice: computedTotal,
        }),
      )}
    >
      <section className="card form-card">
        <div className="section-title">
          <div>
            <p className="eyebrow">{mode === "edit" ? "Edit sale" : "Add sale"}</p>
            <h3>{mode === "edit" ? "Update existing record" : "Create a new sale record"}</h3>
          </div>
        </div>

        <div className="form-grid">
          <label>
            <span>Customer name</span>
            <input {...form.register("customerName", { required: true })} />
          </label>
          <label>
            <span>Seller</span>
            <input list="seller-options" {...form.register("seller", { required: true })} />
            <datalist id="seller-options">
              {optionsQuery.data?.sellers.map((seller) => <option key={seller} value={seller} />)}
            </datalist>
          </label>
          <label>
            <span>Sale date</span>
            <input type="date" {...form.register("saleDate", { required: true })} />
          </label>
          <label>
            <span>City</span>
            <input {...form.register("city", { required: true })} />
          </label>
          <label className="span-2">
            <span>Address</span>
            <input {...form.register("address", { required: true })} />
          </label>
          <label>
            <span>State</span>
            <input {...form.register("state", { required: true })} />
          </label>
          <label>
            <span>Notes</span>
            <input {...form.register("notes")} />
          </label>
        </div>
      </section>

      <section className="card form-card">
        <div className="section-title split">
          <div>
            <p className="eyebrow">Tables</p>
            <h3>Multiple tables in one sale</h3>
          </div>
          <button
            className="secondary-button"
            type="button"
            onClick={() => append({ tableName: "", type: "", size: "", quantity: 1, unitPrice: 0, features: "" })}
          >
            <PlusCircle size={16} />
            Add line
          </button>
        </div>

        <div className="table-line-stack">
          {fields.map((field, index) => (
            <div className="table-line-card" key={field.id}>
              <div className="form-grid">
                <label>
                  <span>Table name</span>
                  <input list="table-name-options" {...form.register(`tables.${index}.tableName` as const, { required: true })} />
                </label>
                <label>
                  <span>Type</span>
                  <input {...form.register(`tables.${index}.type` as const, { required: true })} />
                </label>
                <label>
                  <span>Size</span>
                  <input {...form.register(`tables.${index}.size` as const, { required: true })} />
                </label>
                <label>
                  <span>Quantity</span>
                  <input type="number" min="1" {...form.register(`tables.${index}.quantity` as const, { valueAsNumber: true })} />
                </label>
                <label>
                  <span>Unit price</span>
                  <input type="number" min="0" {...form.register(`tables.${index}.unitPrice` as const, { valueAsNumber: true })} />
                </label>
                <label className="span-2">
                  <span>Features</span>
                  <input {...form.register(`tables.${index}.features` as const)} />
                </label>
              </div>

              <button
                type="button"
                className="text-button danger"
                onClick={() => fields.length > 1 && remove(index)}
              >
                <MinusCircle size={16} />
                Remove
              </button>
            </div>
          ))}
        </div>
        <datalist id="table-name-options">
          {optionsQuery.data?.tableNames.map((name) => <option key={name} value={name} />)}
        </datalist>
      </section>

      <section className="card summary-banner">
        <div>
          <p className="eyebrow">Order total</p>
          <h3>INR {computedTotal.toLocaleString("en-IN")}</h3>
        </div>
        <button className="primary-button" type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Saving..." : mode === "edit" ? "Update sale" : "Save sale"}
        </button>
      </section>
    </form>
  );
}

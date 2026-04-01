import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { MinusCircle, PlusCircle } from "lucide-react";
import { api } from "../lib/api";
const emptySale = {
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
export function SaleFormPage({ mode }) {
    const navigate = useNavigate();
    const params = useParams();
    const queryClient = useQueryClient();
    const saleQuery = useQuery({
        queryKey: ["sale", params.id],
        queryFn: () => api.sale(params.id),
        enabled: mode === "edit" && Boolean(params.id),
    });
    const optionsQuery = useQuery({
        queryKey: ["options"],
        queryFn: api.options,
    });
    const values = useMemo(() => (mode === "edit" && saleQuery.data ? saleQuery.data : emptySale), [mode, saleQuery.data]);
    const form = useForm({ values });
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "tables",
    });
    const mutation = useMutation({
        mutationFn: async (payload) => {
            if (mode === "edit" && params.id)
                return api.updateSale(params.id, payload);
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
    const computedTotal = tables.reduce((sum, table) => sum + Number(table.quantity || 0) * Number(table.unitPrice || 0), 0);
    return (_jsxs("form", { className: "page-stack", onSubmit: form.handleSubmit((payload) => mutation.mutate({
            ...payload,
            totalPrice: computedTotal,
        })), children: [_jsxs("section", { className: "card form-card", children: [_jsx("div", { className: "section-title", children: _jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: mode === "edit" ? "Edit sale" : "Add sale" }), _jsx("h3", { children: mode === "edit" ? "Update existing record" : "Create a new sale record" })] }) }), _jsxs("div", { className: "form-grid", children: [_jsxs("label", { children: [_jsx("span", { children: "Customer name" }), _jsx("input", { ...form.register("customerName", { required: true }) })] }), _jsxs("label", { children: [_jsx("span", { children: "Seller" }), _jsx("input", { list: "seller-options", ...form.register("seller", { required: true }) }), _jsx("datalist", { id: "seller-options", children: optionsQuery.data?.sellers.map((seller) => _jsx("option", { value: seller }, seller)) })] }), _jsxs("label", { children: [_jsx("span", { children: "Sale date" }), _jsx("input", { type: "date", ...form.register("saleDate", { required: true }) })] }), _jsxs("label", { children: [_jsx("span", { children: "City" }), _jsx("input", { ...form.register("city", { required: true }) })] }), _jsxs("label", { className: "span-2", children: [_jsx("span", { children: "Address" }), _jsx("input", { ...form.register("address", { required: true }) })] }), _jsxs("label", { children: [_jsx("span", { children: "State" }), _jsx("input", { ...form.register("state", { required: true }) })] }), _jsxs("label", { children: [_jsx("span", { children: "Notes" }), _jsx("input", { ...form.register("notes") })] })] })] }), _jsxs("section", { className: "card form-card", children: [_jsxs("div", { className: "section-title split", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Tables" }), _jsx("h3", { children: "Multiple tables in one sale" })] }), _jsxs("button", { className: "secondary-button", type: "button", onClick: () => append({ tableName: "", type: "", size: "", quantity: 1, unitPrice: 0, features: "" }), children: [_jsx(PlusCircle, { size: 16 }), "Add line"] })] }), _jsx("div", { className: "table-line-stack", children: fields.map((field, index) => (_jsxs("div", { className: "table-line-card", children: [_jsxs("div", { className: "form-grid", children: [_jsxs("label", { children: [_jsx("span", { children: "Table name" }), _jsx("input", { list: "table-name-options", ...form.register(`tables.${index}.tableName`, { required: true }) })] }), _jsxs("label", { children: [_jsx("span", { children: "Type" }), _jsx("input", { ...form.register(`tables.${index}.type`, { required: true }) })] }), _jsxs("label", { children: [_jsx("span", { children: "Size" }), _jsx("input", { ...form.register(`tables.${index}.size`, { required: true }) })] }), _jsxs("label", { children: [_jsx("span", { children: "Quantity" }), _jsx("input", { type: "number", min: "1", ...form.register(`tables.${index}.quantity`, { valueAsNumber: true }) })] }), _jsxs("label", { children: [_jsx("span", { children: "Unit price" }), _jsx("input", { type: "number", min: "0", ...form.register(`tables.${index}.unitPrice`, { valueAsNumber: true }) })] }), _jsxs("label", { className: "span-2", children: [_jsx("span", { children: "Features" }), _jsx("input", { ...form.register(`tables.${index}.features`) })] })] }), _jsxs("button", { type: "button", className: "text-button danger", onClick: () => fields.length > 1 && remove(index), children: [_jsx(MinusCircle, { size: 16 }), "Remove"] })] }, field.id))) }), _jsx("datalist", { id: "table-name-options", children: optionsQuery.data?.tableNames.map((name) => _jsx("option", { value: name }, name)) })] }), _jsxs("section", { className: "card summary-banner", children: [_jsxs("div", { children: [_jsx("p", { className: "eyebrow", children: "Order total" }), _jsxs("h3", { children: ["INR ", computedTotal.toLocaleString("en-IN")] })] }), _jsx("button", { className: "primary-button", type: "submit", disabled: mutation.isPending, children: mutation.isPending ? "Saving..." : mode === "edit" ? "Update sale" : "Save sale" })] })] }));
}

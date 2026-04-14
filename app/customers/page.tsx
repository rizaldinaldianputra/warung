"use client";

import React, { useState, useEffect } from "react";
import { Customer } from "@/types";
import { 
  Users, 
  Search, 
  Plus, 
  Mail, 
  Phone, 
  MapPin, 
  MoreHorizontal,
  ExternalLink,
  Edit2,
  Trash2,
  X
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "@/lib/actions/customers";

export default function CustomersPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setIsLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to fetch customers", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let res;
      if (editingId) {
        res = await updateCustomer(editingId, form);
      } else {
        res = await createCustomer(form);
      }

      if (res.error) throw new Error(res.error);
      
      handleCloseModal();
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || "Failed to save customer");
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    setIsDeleting(id);
    try {
      const res = await deleteCustomer(id);
      if (res.error) throw new Error(res.error);
      fetchCustomers();
    } catch (err: any) {
      alert(err.message || "Failed to delete customer");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleOpenEdit = (customer: any) => {
    setEditingId(customer.id);
    setForm({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setForm({ name: "", email: "", phone: "", address: "" });
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers Directory</h1>
          <p className="text-slate-500">Manage your loyal warung customers and their database.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Customer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Active Customers", value: customers.length.toString(), icon: Users, color: "text-navy", bg: "bg-navy/5" },
          { label: "New this month", value: "0", icon: Plus, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Orders", value: "0", icon: ExternalLink, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Avg. Spend", value: "Rp 0", icon: Mail, color: "text-navy", bg: "bg-navy/5" },
        ].map((item, i) => (
          <Card key={i} className="bg-white border-slate-100">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`${item.bg} ${item.color} p-2.5 rounded-xl`}>
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{item.label}</p>
                <p className="text-lg font-bold text-slate-900">{item.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>All Customers</CardTitle>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name, email or phone..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy transition-all bg-slate-50 focus:bg-white"
            />
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center text-slate-400">Loading customers...</TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-20 text-center text-slate-400">No customers found.</TableCell>
              </TableRow>
            ) : filteredCustomers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-slate-200">
                      {customer.name?.substring(0, 1)}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{customer.name}</span>
                      <span className="text-xs text-slate-500 overflow-hidden text-ellipsis max-w-[150px]">ID: {customer.id}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Mail className="h-3 w-3 text-slate-400" />
                      {customer.email}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Phone className="h-3 w-3 text-slate-400" />
                      {customer.phone}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 max-w-[200px] truncate">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                    {customer.address}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-slate-500">
                  {new Date(customer.createdAt).toLocaleDateString("id-ID")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-slate-400 hover:text-navy"
                      onClick={() => handleOpenEdit(customer)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                      onClick={() => handleDelete(customer.id)}
                      isLoading={isDeleting === customer.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingId ? "Edit Customer Info" : "Register New Customer"}
        footer={
          <>
            <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
            <Button onClick={handleSave}>
              {editingId ? "Update Info" : "Register Customer"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Full Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Budi Santoso" 
              value={form.name}
              onChange={(e) => setForm({...form, name: e.target.value})}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email Address</label>
              <input 
                type="email" 
                required
                placeholder="budi@example.com" 
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Phone Number</label>
              <input 
                type="tel" 
                required
                placeholder="0812..." 
                value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value})}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700">Shipping Address</label>
            <textarea 
              rows={3}
              required
              placeholder="Full address..." 
              value={form.address}
              onChange={(e) => setForm({...form, address: e.target.value})}
              className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
}

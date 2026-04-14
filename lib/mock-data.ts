import { Product, Order } from "@/types";

export const productsData: Product[] = [
  { id: "1", name: "Beras Pandan Wangi", sku: "SKU-BRS-001", category: "Sembako", unit: "karung 5kg", price: 75000, stock: 12, description: "Beras kualitas super dari Cianjur, nasi pulen dan wangi alami.", created_at: "" },
  { id: "2", name: "Minyak Goreng Bimoli", sku: "SKU-MYK-002", category: "Sembako", unit: "liter", price: 18500, stock: 45, description: "Minyak goreng kelapa sawit bermutu tinggi.", created_at: "" },
  { id: "3", name: "Telur Ayam Negeri", sku: "SKU-TLR-003", category: "Sembako", unit: "kg", price: 28000, stock: 8, description: "Telur ayam segar harian, langsung dari peternakan.", created_at: "" },
  { id: "4", name: "Indomie Goreng", sku: "SKU-SNK-004", category: "Snack", unit: "dus", price: 115000, stock: 5, description: "Indomie goreng isi 40 bungkus.", created_at: "" },
  { id: "5", name: "Gula Pasir Gulaku", sku: "SKU-SEM-005", category: "Sembako", unit: "kg", price: 16000, stock: 25, description: "Gula pasir putih kristal premium.", created_at: "" },
  { id: "6", name: "Kopi Kapal Api", sku: "SKU-MNM-006", category: "Minuman", unit: "renceng", price: 15000, stock: 10, description: "Kopi hitam plus gula, 10 sachet.", created_at: "" },
  { id: "7", name: "Teh Kotak Sosro", sku: "SKU-MNM-007", category: "Minuman", unit: "pcs", price: 4000, stock: 32, description: "Teh melati dalam kemasan kotak 300ml.", created_at: "" },
  { id: "8", name: "Susu UHT Ultra Milk", sku: "SKU-MNM-008", category: "Minuman", unit: "liter", price: 19500, stock: 15, description: "Susu cair segar rasa plain/cokelat.", created_at: "" },
];

export const mockOrders: Order[] = [
  { id: "ORD-001", customer_id: "1", status: "READY", total_amount: 125000, created_at: "2026-04-12T10:00:00Z", customer: { name: "Ibu Siti", email: "", phone: "", address: "Pasar Baru No. 5", id: "1", created_at: "" } },
  { id: "ORD-002", customer_id: "2", status: "PENDING", total_amount: 45000, created_at: "2026-04-12T09:30:00Z", customer: { name: "Pak Budi", email: "", phone: "", address: "Jl. Merdeka 10", id: "2", created_at: "" } },
  { id: "ORD-003", customer_id: "3", status: "DELIVERED", total_amount: 110000, created_at: "2026-04-11T15:20:00Z", customer: { name: "Warung Berkah", email: "", phone: "", address: "Gg. Kelinci 4", id: "3", created_at: "" } },
];

import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, Search, ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast'; 

export default function ProductsMgmt() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  
  const [currentProduct, setCurrentProduct] = useState({ 
    nombre: '', descripcion: '', precio: 0, stock: 0, imagen: '', talla: '', color: '', archivo: null 
  });
  

  const token = localStorage.getItem('token');

  const fetchProducts = async () => {
    try {
      const res = await api.get('/productos');
      setProducts(res.data);
    } catch(e) { toast.error("Imposible cargar el inventario"); }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if(!currentProduct.talla) {
         toast.error("Debes seleccionar mínimo una talla");
         return;
      }

      const formData = new FormData();
      formData.append('nombre', currentProduct.nombre);
      formData.append('descripcion', currentProduct.descripcion);
      formData.append('precio', currentProduct.precio);
      formData.append('stock', currentProduct.stock);
      formData.append('talla', currentProduct.talla);
      formData.append('color', currentProduct.color);
      
      if (currentProduct.archivo) {
         formData.append('imagen', currentProduct.archivo);
      } else if (currentProduct.imagen) {
         formData.append('imagenUrlActual', currentProduct.imagen);
      }

      if (currentProduct.id) {
        await api.put(`/productos/${currentProduct.id}`, formData, { 
          headers: { 'Content-Type': 'multipart/form-data'} 
        });
        toast.success("Camiseta Actualizada!");
      } else {
        await api.post('/productos', formData, { 
          headers: { 'Content-Type': 'multipart/form-data'} 
        });
        toast.success("Prenda Agregada Exitosamente!");
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.message || "Error guardando formulario. Tamaño máximo foto: 5MB");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Confirmas que deseas eliminar permanentemente esta prenda?')) {
      try {
        await api.delete(`/productos/${id}`);
        toast.success("Producto purgado", { icon: '🗑️' });
        fetchProducts();
      } catch (err) { toast.error("Error al borrar del sistema"); }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setCurrentProduct({ ...currentProduct, archivo: file });
  };

  const filtered = products.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()));

  // Lógica controlada de Selección de Tallas (Checkboxes)
  const toggleTalla = (t) => {
     let arr = currentProduct.talla ? currentProduct.talla.split(',').map(s=>s.trim()).filter(Boolean) : [];
     if(arr.includes(t)) arr = arr.filter(x => x !== t); 
     else arr.push(t);
     // Re-empaquetamos el string SQL: "S, M, L"
     setCurrentProduct({...currentProduct, talla: arr.join(', ')});
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">Catálogo Físico</h2>
        <button onClick={() => { setCurrentProduct({ nombre: '', descripcion: '', precio: 0, stock: 0, imagen: '', talla: '', color: '', archivo: null }); setShowModal(true); }} 
           className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 font-bold rounded-xl flex items-center shadow-md transition-colors w-full sm:w-auto justify-center active:scale-95">
          <Plus className="w-5 h-5 mr-2 text-purple-400" /> Crear Nueva Etiqueta
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
           <div className="relative w-full sm:w-80">
             <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
             <input type="text" placeholder="Buscar por estilo o prenda..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:border-transparent focus:ring-purple-500 transition-all font-medium text-sm bg-white shadow-inner" onChange={e => setSearchTerm(e.target.value)} />
           </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
             <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold uppercase tracking-widest text-[10px] border-b border-gray-100">
                <th className="p-5">Foto</th>
                <th className="p-5">Identificador de Prenda</th>
                <th className="p-5">Costo Retail</th>
                <th className="p-5">Almacén (Ud.)</th>
                <th className="p-5 text-right w-28">Opciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/70 transition-colors group">
                  <td className="p-5">
                    {p.imagen ? (
                      <img src={p.imagen} className="w-14 h-14 rounded-xl object-cover shadow border border-gray-200" alt={p.nombre} />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200 text-gray-400"><ImageIcon className="w-6 h-6" /></div>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="font-extrabold text-gray-900 group-hover:text-purple-700 transition-colors">{p.nombre}</div>
                    <div className="text-[11px] text-gray-500 font-bold mt-1 uppercase tracking-widest leading-none drop-shadow-sm"><span className="text-gray-400">Tallas:</span> {p.talla || 'Genérica'} &bull; <span className="text-gray-400">Tinte:</span> {p.color || 'No definido'}</div>
                  </td>
                  <td className="p-5 font-black text-gray-700 text-base">${parseFloat(p.precio).toFixed(2)}</td>
                  <td className="p-5">
                     <span className={`px-3 py-1.5 rounded-lg text-xs font-black shadow-sm ${p.stock > 10 ? 'bg-emerald-100 text-emerald-800' : p.stock > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>
                      {p.stock} UDS
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex gap-2 justify-end opacity-70 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setCurrentProduct({...p, archivo: null}); setShowModal(true); }} className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-100"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan="5" className="p-10 text-center text-gray-400 font-bold uppercase">Sin registros en base de datos</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl shadow-purple-900/20 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <h3 className="text-2xl font-black p-6 border-b border-gray-100 bg-gray-50/80 tracking-tight">{currentProduct.id ? 'Editor Activo' : 'Molde de Nueva Prenda'}</h3>
            <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto w-full">
              
              <div className="p-5 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 flex flex-col items-center justify-center text-center group hover:border-purple-400 transition-colors">
                 <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-purple-400 transition-colors mb-2" />
                 <label className="text-sm font-bold text-gray-700 uppercase cursor-pointer group-hover:text-purple-700 transition-colors tracking-widest">
                    Selecciona una Fotografía HD (PNG, JPG)
                    <input type="file" className="hidden" accept="image/png, image/jpeg, image/jpg" onChange={handleFileChange} />
                 </label>
                 {currentProduct.archivo && <span className="text-xs text-purple-700 font-bold mt-2 bg-purple-100 px-3 py-1 rounded-full">📷 Preparada: {currentProduct.archivo.name}</span>}
                 {!currentProduct.archivo && currentProduct.imagen && <span className="text-xs text-emerald-600 mt-2 font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> Imagen activa y protegida en servidor.</span>}
              </div>

              <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Nombre Comercial de Camiseta</label><input required value={currentProduct.nombre} onChange={e=>setCurrentProduct({...currentProduct, nombre: e.target.value})} className="mt-1 w-full border border-gray-200 rounded-xl p-3 outline-none font-bold focus:border-transparent focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all"/></div>
              
              <div className="flex flex-col sm:flex-row gap-5">
                <div className="flex-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Precio Unitario ($)</label><input required type="number" step="0.01" value={currentProduct.precio} onChange={e=>setCurrentProduct({...currentProduct, precio: e.target.value})} className="mt-1 w-full border border-gray-200 rounded-xl p-3 outline-none font-bold focus:border-transparent focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all"/></div>
                <div className="flex-1"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Existencias Totales</label><input required type="number" value={currentProduct.stock} onChange={e=>setCurrentProduct({...currentProduct, stock: e.target.value})} className="mt-1 w-full border border-gray-200 rounded-xl p-3 outline-none font-bold focus:border-transparent focus:ring-2 focus:ring-purple-500 bg-gray-50 transition-all"/></div>
              </div>
               
              <div className="flex flex-col sm:flex-row gap-5 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <div className="flex-1">
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Tallas Fabricadas (Mín. 1)</label>
                   <div className="mt-3 flex gap-3 flex-wrap">
                     {['S', 'M', 'L', 'XL'].map(t => (
                        <label key={t} className={`flex items-center justify-center w-12 h-12 rounded-xl border-2 cursor-pointer font-black transition-all ${currentProduct.talla?.includes(t) ? 'border-purple-600 bg-purple-50 text-purple-700' : 'border-gray-200 bg-white text-gray-400 hover:border-gray-300'}`}>
                           <input type="checkbox" className="hidden" checked={currentProduct.talla?.includes(t)} onChange={() => toggleTalla(t)} />
                           {t}
                        </label>
                     ))}
                   </div>
                </div>
                <div className="flex-1"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest pl-1">Línea de Color (Ej: Oscuros)</label><input value={currentProduct.color} onChange={e=>setCurrentProduct({...currentProduct, color: e.target.value})} className="mt-3 w-full border border-gray-200 rounded-xl p-3 outline-none font-bold bg-white focus:border-transparent focus:ring-2 focus:ring-purple-500 transition-all"/></div>
              </div>

              <div><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Descripción del Tejido/Corte</label><textarea value={currentProduct.descripcion} onChange={e=>setCurrentProduct({...currentProduct, descripcion: e.target.value})} className="mt-1 w-full border border-gray-200 rounded-xl p-3 outline-none font-medium focus:border-transparent focus:ring-2 focus:ring-purple-500 bg-gray-50 min-h-24 resize-none transition-all"></textarea></div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 hover:text-gray-900 rounded-xl transition-colors">Volver sin guardar</button>
                <button type="submit" className="px-6 py-3 font-bold bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)] transition-all active:scale-95">Inyectar en Base de Datos</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

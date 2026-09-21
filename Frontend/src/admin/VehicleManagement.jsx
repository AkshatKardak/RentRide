import React, { useState, useEffect } from 'react';
import {
  Car,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Fuel,
  Gauge,
  MapPin,
  Save,
  X,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useTheme } from '../context/ThemeContext';
import { getCarImageUrl, heroCarImg } from '../utils/carImageMap';

export default function VehicleManagement() {
  const { isDarkMode } = useTheme();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [city, setCity] = useState('All');
  const [available, setAvailable] = useState('All');

  // Edit price modal / inline
  const [editingCar, setEditingCar] = useState(null);
  const [newPrice, setNewPrice] = useState('');

  // Image Management Modal
  const [imageModalCar, setImageModalCar] = useState(null);
  const [imageForm, setImageForm] = useState({
    primaryImage: '',
    imageSource: '',
    license: '',
    verificationStatus: 'verified'
  });
  const [savingImage, setSavingImage] = useState(false);

  const handleOpenImageModal = (car) => {
    setImageModalCar(car);
    setImageForm({
      primaryImage: car.primaryImage || car.images?.[0] || '',
      imageSource: car.imageMetadata?.imageSource || 'Unsplash Verified Indian Fleet Photography',
      license: car.imageMetadata?.license || 'Unsplash Permissive License',
      verificationStatus: car.imageMetadata?.verificationStatus || 'verified'
    });
  };

  const handleSaveImage = async (e) => {
    e.preventDefault();
    if (!imageModalCar) return;
    try {
      setSavingImage(true);
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.patch(
        `${baseUrl}/admin/cars/${imageModalCar._id}/image`,
        imageForm,
        { headers }
      );

      if (res.data?.success) {
        toast.success('Vehicle image updated and verified');
        setCars(prev => prev.map(c => c._id === imageModalCar._id ? res.data.data : c));
        setImageModalCar(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update vehicle image');
    } finally {
      setSavingImage(false);
    }
  };

  // Add Car Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCarForm, setNewCarForm] = useState({
    brand: '',
    model: '',
    variant: 'Base',
    year: 2023,
    category: 'sedan',
    fuelType: 'petrol',
    transmission: 'manual',
    pricePerDay: 2200,
    city: 'Mumbai',
    primaryImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80'
  });

  useEffect(() => {
    fetchCars();
  }, [category, city, available]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.get(`${baseUrl}/admin/cars`, {
        params: {
          search: search || undefined,
          category: category !== 'All' ? category : undefined,
          city: city !== 'All' ? city : undefined,
          available: available !== 'All' ? available : undefined,
          limit: 50
        },
        headers
      });

      if (res.data?.success) {
        setCars(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching cars:', err);
      toast.error('Failed to load vehicle fleet');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCars();
  };

  const handleToggleAvailability = async (carId, currentVal) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.patch(
        `${baseUrl}/admin/cars/${carId}/status`,
        { available: !currentVal, status: !currentVal ? 'active' : 'maintenance' },
        { headers }
      );

      if (res.data?.success) {
        toast.success(`Vehicle status updated to ${!currentVal ? 'Available' : 'Unavailable'}`);
        setCars(prev => prev.map(c => c._id === carId ? { ...c, available: !currentVal, status: !currentVal ? 'active' : 'maintenance' } : c));
      }
    } catch (err) {
      toast.error('Failed to update availability');
    }
  };

  const handleSavePrice = async (carId) => {
    if (!newPrice || isNaN(newPrice) || Number(newPrice) <= 0) {
      toast.error('Enter a valid price');
      return;
    }

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.patch(
        `${baseUrl}/admin/cars/${carId}/status`,
        { pricePerDay: Number(newPrice) },
        { headers }
      );

      if (res.data?.success) {
        toast.success('Rental price updated');
        setCars(prev => prev.map(c => c._id === carId ? { ...c, pricePerDay: Number(newPrice) } : c));
        setEditingCar(null);
      }
    } catch (err) {
      toast.error('Failed to update price');
    }
  };

  const handleDeleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to remove this vehicle from the fleet?')) return;

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      await axios.delete(`${baseUrl}/admin/cars/${carId}`, { headers });
      toast.success('Vehicle removed from fleet');
      setCars(prev => prev.filter(c => c._id !== carId));
    } catch (err) {
      toast.error('Failed to delete vehicle');
    }
  };

  const handleCreateCar = async (e) => {
    e.preventDefault();
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(`${baseUrl}/admin/cars`, newCarForm, { headers });
      if (res.data?.success) {
        toast.success('Vehicle added to fleet');
        setShowAddModal(false);
        fetchCars();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create car');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">Fleet Vehicle Management</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Configure rates, monitor trust scores, and inspect vehicle availability
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-500/20 flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center gap-3 ${
        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
      }`}>
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search by brand, model, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-transparent text-sm border rounded-xl border-inherit focus:outline-none focus:border-emerald-500"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border bg-transparent border-inherit focus:outline-none"
          >
            <option value="All">All Categories</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="hatchback">Hatchback</option>
            <option value="mpv">MPV</option>
            <option value="luxury">Luxury</option>
          </select>

          <select
            value={available}
            onChange={(e) => setAvailable(e.target.value)}
            className="px-3 py-2 text-xs font-semibold rounded-xl border bg-transparent border-inherit focus:outline-none"
          >
            <option value="All">All Status</option>
            <option value="true">Available</option>
            <option value="false">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className={`rounded-2xl border overflow-hidden ${
        isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-100 shadow-sm'
      }`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className={`border-b text-slate-400 uppercase font-bold text-[10px] tracking-wider ${
              isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <tr>
                <th className="py-3.5 px-4">Vehicle</th>
                <th className="py-3.5 px-4">Variant</th>
                <th className="py-3.5 px-4">Year</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Price/Day</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Trust</th>
                <th className="py-3.5 px-4">Image Status</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading vehicle inventory...
                  </td>
                </tr>
              ) : cars.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No vehicles found matching criteria
                  </td>
                </tr>
              ) : (
                cars.map((car) => {
                  const isEditingThis = editingCar === car._id;
                  return (
                    <tr key={car._id} className="hover:bg-slate-500/5 transition-colors">
                      <td className="py-3 px-4 font-bold flex items-center gap-2">
                        <div
                          className="relative group cursor-pointer"
                          onClick={() => handleOpenImageModal(car)}
                          title="Click to view/edit image & provenance"
                        >
                          <img
                            src={getCarImageUrl(car)}
                            alt={car.model}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = heroCarImg;
                            }}
                            className="w-10 h-7 object-cover rounded-md border border-slate-200 dark:border-slate-800 group-hover:opacity-75 transition-opacity"
                          />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded-md transition-opacity">
                            <ImageIcon size={12} className="text-white" />
                          </div>
                        </div>
                        <div>
                          <p className="font-bold">{car.brand} {car.model}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-mono">{car.fuelType} • {car.transmission}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{car.variant || 'Base'}</td>
                      <td className="py-3 px-4 font-medium">{car.year}</td>
                      <td className="py-3 px-4 capitalize">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10">
                          {car.category || 'Sedan'}
                        </span>
                      </td>
                      <td className="py-3 px-4">{car.city || 'N/A'}</td>
                      <td className="py-3 px-4 font-bold">
                        {isEditingThis ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              value={newPrice}
                              onChange={(e) => setNewPrice(e.target.value)}
                              className="w-20 px-2 py-1 bg-transparent border rounded text-xs focus:outline-none border-emerald-500"
                            />
                            <button
                              onClick={() => handleSavePrice(car._id)}
                              className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded"
                            >
                              <Save size={14} />
                            </button>
                            <button
                              onClick={() => setEditingCar(null)}
                              className="p-1 text-slate-400 hover:bg-slate-500/10 rounded"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-500">₹{car.pricePerDay || 2200}</span>
                            <button
                              onClick={() => { setEditingCar(car._id); setNewPrice(car.pricePerDay); }}
                              className="text-slate-400 hover:text-slate-200"
                            >
                              <Edit2 size={12} />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold">
                        {car.rating ? `${car.rating}★` : <span className="text-slate-400 font-mono">—</span>}
                      </td>
                      <td className="py-3 px-4">
                        {car.trustScore ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            car.trustScore >= 80 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {car.trustScore}/100
                          </span>
                        ) : (
                          <span className="text-slate-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {car.imageMetadata?.verificationStatus === 'verified' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            <CheckCircle2 size={10} /> Verified
                          </span>
                        ) : car.imageMetadata?.verificationStatus === 'fallback' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Fallback
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20">
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleAvailability(car._id, car.available)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                            car.available
                              ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20'
                          }`}
                        >
                          {car.available ? 'Available' : 'Unavailable'}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenImageModal(car)}
                            title="Manage Vehicle Image & Provenance"
                            className="p-1.5 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          >
                            <ImageIcon size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCar(car._id)}
                            title="Delete Vehicle"
                            className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Image & Provenance Modal */}
      {imageModalCar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-lg">Vehicle Image & Provenance</h3>
                <p className="text-xs text-slate-400">{imageModalCar.brand} {imageModalCar.model} ({imageModalCar.year})</p>
              </div>
              <button 
                onClick={() => setImageModalCar(null)} 
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Current Image Preview */}
            <div className="mb-4 p-4 rounded-2xl bg-slate-500/5 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center">
              <img
                src={imageForm.primaryImage || heroCarImg}
                alt="Preview"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = heroCarImg;
                }}
                className="max-h-36 max-w-full object-contain drop-shadow"
              />
              <p className="text-[10px] text-slate-400 mt-2">Live Preview</p>
            </div>

            <form onSubmit={handleSaveImage} className="space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1">Image URL (HTTPS or relative asset)</label>
                <input
                  type="text"
                  required
                  placeholder="https://images.unsplash.com/photo-... or /assets/herocar.png"
                  value={imageForm.primaryImage}
                  onChange={(e) => setImageForm({ ...imageForm, primaryImage: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-transparent border-inherit focus:outline-none focus:border-emerald-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Protected against SSRF. Allowed hosts: Unsplash, Cloudinary, ImgBB, Wikimedia, Pexels.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Image Source / Provenance</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unsplash Verified Indian Fleet Photography"
                    value={imageForm.imageSource}
                    onChange={(e) => setImageForm({ ...imageForm, imageSource: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-transparent border-inherit focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">License</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unsplash Permissive License"
                    value={imageForm.license}
                    onChange={(e) => setImageForm({ ...imageForm, license: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-transparent border-inherit focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Verification Status</label>
                <select
                  value={imageForm.verificationStatus}
                  onChange={(e) => setImageForm({ ...imageForm, verificationStatus: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border bg-transparent border-inherit focus:outline-none"
                >
                  <option value="verified">Verified (Exact Model Match & Licensed)</option>
                  <option value="unverified">Unverified (Pending Review)</option>
                  <option value="fallback">Fallback (Generic Catalog Illustration)</option>
                  <option value="rejected">Rejected (Does not match vehicle)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={savingImage}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  {savingImage ? 'Validating & Saving...' : 'Save & Verify Image'}
                </button>
                <button
                  type="button"
                  onClick={() => setImageModalCar(null)}
                  className="px-4 py-2.5 border rounded-xl hover:bg-slate-500/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Car Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Add New Fleet Vehicle</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCar} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Brand</label>
                  <input
                    type="text"
                    required
                    placeholder="Hyundai, Tata, Toyota..."
                    value={newCarForm.brand}
                    onChange={(e) => setNewCarForm({ ...newCarForm, brand: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-transparent border-inherit focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Model</label>
                  <input
                    type="text"
                    required
                    placeholder="Creta, Harrier, Fortuner..."
                    value={newCarForm.model}
                    onChange={(e) => setNewCarForm({ ...newCarForm, model: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-transparent border-inherit focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">Year</label>
                  <input
                    type="number"
                    value={newCarForm.year}
                    onChange={(e) => setNewCarForm({ ...newCarForm, year: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border bg-transparent border-inherit focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Category</label>
                  <select
                    value={newCarForm.category}
                    onChange={(e) => setNewCarForm({ ...newCarForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-transparent border-inherit focus:outline-none"
                  >
                    <option value="sedan">Sedan</option>
                    <option value="suv">SUV</option>
                    <option value="hatchback">Hatchback</option>
                    <option value="mpv">MPV</option>
                    <option value="luxury">Luxury</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Price/Day (₹)</label>
                  <input
                    type="number"
                    value={newCarForm.pricePerDay}
                    onChange={(e) => setNewCarForm({ ...newCarForm, pricePerDay: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border bg-transparent border-inherit focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">City</label>
                  <input
                    type="text"
                    value={newCarForm.city}
                    onChange={(e) => setNewCarForm({ ...newCarForm, city: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-transparent border-inherit focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Transmission</label>
                  <select
                    value={newCarForm.transmission}
                    onChange={(e) => setNewCarForm({ ...newCarForm, transmission: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border bg-transparent border-inherit focus:outline-none"
                  >
                    <option value="manual">Manual</option>
                    <option value="automatic">Automatic</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20"
              >
                Save Vehicle
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  Car,
  Calendar,
  CreditCard,
  Sparkles,
  Plus,
  TrendingUp,
  Clock,
  ArrowRight,
  AlertTriangle,
  Zap,
  AlertCircle
} from "lucide-react";
import { bookingService } from '../services/bookingService';
import damageService from '../services/damageService';
import DashboardNavbar from '../components/layout/DashboardNavbar';
import EChartCard from "../components/common/EChartCard";
import { carService } from '../services/carService';

/* =========================
   MAIN COMPONENT
========================= */

const AppDashboard = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [userName, setUserName] = useState("Guest");
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeBookings: 0,
    pendingPayments: 0,
    pendingDamages: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [currentRental, setCurrentRental] = useState(null);
  const [pendingItems, setPendingItems] = useState([]);
  const [recommendedCars, setRecommendedCars] = useState([]);
  const [spendingChartData, setSpendingChartData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const firstName = user.name ? user.name.split(' ')[0] : 'Guest';
        setUserName(firstName);
      }

      // Fetch user data
      const [bookingsRes, damagesRes] = await Promise.all([
        bookingService.getUserBookings(),
        damageService.getUserDamageReports()
      ]);

      const bookings = bookingsRes.data || [];
      const damages = damagesRes.data || [];

      // Calculate stats
      const active = bookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;
      const pendingPay = bookings.filter(b => b.paymentStatus === 'pending' && b.status !== 'cancelled').length;
      const pendingDmg = damages.filter(d => d.paymentStatus === 'pending' && d.status === 'approved').length;

      setStats({
        totalBookings: bookings.length,
        activeBookings: active,
        pendingPayments: pendingPay,
        pendingDamages: pendingDmg
      });

      // Detailed Pending Items
      const items = [];
      bookings.filter(b => b.paymentStatus === 'pending' && b.status !== 'cancelled').forEach(b => {
        items.push({
          id: b._id,
          type: 'booking',
          title: 'Booking Payment Due',
          car: b.car ? `${b.car.brand} ${b.car.model}` : 'Unknown Car',
          amount: b.totalPrice,
          link: '/payment',
          data: {
            bookingId: b._id,
            carId: b.car?._id,
            carName: b.car ? `${b.car.brand} ${b.car.model}` : 'Unknown Car',
            totalPrice: b.totalPrice,
            startDate: b.startDate,
            endDate: b.endDate,
            days: Math.ceil((new Date(b.endDate) - new Date(b.startDate)) / (1000 * 60 * 60 * 24)) || 1
          }
        });
      });

      damages.filter(d => d.paymentStatus === 'pending' && d.status === 'approved').forEach(d => {
        items.push({
          id: d._id,
          type: 'damage',
          title: 'Damage Repair Bill',
          car: d.car ? `${d.car.brand} ${d.car.model}` : 'Unknown Car',
          amount: d.actualCost,
          link: '/payment',
          data: {
            damageReportId: d._id,
            carId: d.car?._id,
            carName: d.car ? `${d.car.brand} ${d.car.model}` : 'Unknown Car',
            actualCost: d.actualCost,
            bookingId: d.booking?._id || d.booking
          }
        });
      });

      setPendingItems(items);

      // Find current rental (confirmed and future end date)
      const now = new Date();
      const current = bookings.find(b =>
        b.status === 'confirmed' &&
        new Date(b.endDate) > now &&
        new Date(b.startDate) <= now
      );

      if (current) {
        setCurrentRental({
          name: current.car ? `${current.car.brand} ${current.car.model}` : 'Unknown Car',
          endDate: new Date(current.endDate).toLocaleDateString()
        });
      }

      // Fetch Real Recommendations from Database
      try {
        const featRes = await carService.getFeaturedCars();
        if (featRes.success && Array.isArray(featRes.data)) {
          setRecommendedCars(featRes.data.slice(0, 4));
        }
      } catch (cErr) {
        console.warn('Could not fetch recommendations:', cErr.message);
      }

      // Generate Spending Analytics Chart if bookings exist
      if (bookings.length > 0) {
        const validBookings = bookings.filter(b => b.status !== 'cancelled');
        if (validBookings.length > 0) {
          const tripLabels = validBookings.slice(0, 6).map((b, i) => b.car?.model || `Trip ${i + 1}`);
          const tripAmounts = validBookings.slice(0, 6).map(b => b.totalPrice || 0);

          setSpendingChartData({
            tooltip: { trigger: 'axis', formatter: '{b}: ₹{c}' },
            grid: { top: 25, right: 15, bottom: 25, left: 55 },
            xAxis: {
              type: 'category',
              data: tripLabels,
              axisLine: { lineStyle: { color: isDarkMode ? '#475569' : '#cbd5e1' } }
            },
            yAxis: {
              type: 'value',
              axisLabel: { formatter: '₹{value}' },
              splitLine: { lineStyle: { color: isDarkMode ? '#334155' : '#f1f5f9' } }
            },
            series: [{
              data: tripAmounts,
              type: 'bar',
              itemStyle: { color: '#10b981', borderRadius: [6, 6, 0, 0] }
            }]
          });
        }
      }

      // Generate Recent Activity
      const activities = [];

      // Add recent bookings
      bookings.slice(0, 3).forEach(b => {
        activities.push({
          title: `Booking ${b.status.charAt(0).toUpperCase() + b.status.slice(1)}`,
          sub: `${b.car?.brand} ${b.car?.model} • ${new Date(b.createdAt).toLocaleDateString()}`,
          status: b.status === 'confirmed' ? 'success' : 'info',
          date: new Date(b.createdAt)
        });
      });

      // Add recent damages
      damages.slice(0, 3).forEach(d => {
        let status = 'info';
        let title = "Damage Reported";
        if (d.status === 'approved') {
          status = 'warning';
          title = "Damage Approved";
        } else if (d.status === 'rejected') {
          status = 'success';
          title = "Damage Dismissed";
        }

        activities.push({
          title: title,
          sub: `${d.car?.brand} ${d.car?.model} • ${new Date(d.createdAt).toLocaleDateString()}`,
          status: status,
          date: new Date(d.createdAt)
        });
      });

      // Sort by date desc
      activities.sort((a, b) => b.date - a.date);
      setRecentActivity(activities.slice(0, 4));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const theme = {
    bg: isDarkMode ? '#0f172a' : '#f8f9fa',
    cardBg: isDarkMode ? '#1e293b' : '#ffffff',
    text: isDarkMode ? '#f1f5f9' : '#1F2937',
    textSecondary: isDarkMode ? '#cbd5e1' : '#6B7280',
    border: isDarkMode ? '#334155' : '#e5e7eb',
    inputBg: isDarkMode ? '#0f172a' : '#f8f9fa',
  };

  return (
    <>
      <DashboardNavbar />
      <div
        className="min-h-screen pt-20 transition-colors duration-300"
        style={{ backgroundColor: theme.bg }}
      >
        <main className="max-w-7xl mx-auto px-6 py-10 space-y-10">

          {/* WELCOME SECTION */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tight" style={{ color: theme.text }}>
                Welcome back, <span className="text-green-500 italic">{userName}</span>
              </h1>
              <p className="text-lg max-w-md" style={{ color: theme.textSecondary }}>
                Your premium garage is ready. Where would you like to drive today?
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/browsecars")}
              className="flex items-center gap-3 bg-green-500 text-white px-8 py-4 rounded-2xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 font-black tracking-widest text-sm"
            >
              <Plus size={20} /> NEW BOOKING
            </button>
          </div>

          {/* STATS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <StatCard
              title="Current Rental"
              value={currentRental ? currentRental.name : "No Active Rental"}
              sub={currentRental ? `Return by ${currentRental.endDate}` : "Ready to book"}
              icon={<Car className="w-5 h-5 text-green-500" />}
              theme={theme}
            />
            <StatCard
              title="Total Bookings"
              value={stats.totalBookings}
              sub={`${stats.activeBookings} active trips`}
              icon={<Calendar className="w-5 h-5 text-green-500" />}
              theme={theme}
            />
            <StatCard
              title="Pending Actions"
              value={stats.pendingPayments + stats.pendingDamages}
              sub="Payments & Reports"
              icon={<AlertTriangle className="w-5 h-5 text-orange-500" />}
              theme={theme}
            />
          </div>

          {/* QUICK ACTIONS */}
          <div className="space-y-6">
            <h2
              className="text-xl font-black uppercase tracking-widest opacity-70 flex items-center gap-2"
              style={{ color: theme.text }}
            >
              <Zap size={18} className="text-emerald-500" />
              <span>Quick Access</span>
            </h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <QuickAction
                icon={<Car />}
                label="Browse Cars"
                onClick={() => navigate("/browsecars")}
                theme={theme}
              />
              <QuickAction
                icon={<Calendar />}
                label="My Bookings"
                onClick={() => navigate("/mybookings")}
                theme={theme}
              />
              <QuickAction
                icon={<AlertTriangle />}
                label="Damage Reports"
                onClick={() => navigate("/mybookings")}
                theme={theme}
                highlight={stats.pendingDamages > 0}
              />
              <QuickAction
                icon={<CreditCard />}
                label="Payments"
                onClick={() => navigate("/payment")}
                theme={theme}
                highlight={stats.pendingPayments > 0}
              />
            </div>
          </div>

          {/* ACTION ITEMS SECTION */}
          {pendingItems.length > 0 && (
            <div className="space-y-6">
              <h2
                className="text-xl font-black uppercase tracking-widest opacity-70 flex items-center gap-2"
                style={{ color: theme.text }}
              >
                <AlertCircle size={18} className="text-rose-500" />
                <span>Action Required</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl p-6 border shadow-lg flex items-center justify-between group transition-all"
                    style={{ backgroundColor: theme.cardBg, borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  >
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Remaining</p>
                      <h4 className="font-black text-sm" style={{ color: theme.text }}>{item.title}</h4>
                      <p className="text-xs opacity-60" style={{ color: theme.textSecondary }}>{item.car}</p>
                      <p className="text-lg font-black text-green-500 italic">₹{item.amount?.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => navigate(item.link, { state: item.data })}
                      className="p-3 rounded-xl bg-red-500 text-white shadow-lg shadow-red-500/20 hover:scale-110 active:scale-95 transition-all"
                    >
                      <ArrowRight size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MAIN LAYOUT GRID */}
          <div className="grid lg:grid-cols-3 gap-10">

            {/* USER ANALYTICS & RECOMMENDED SECTION */}
            <div className="lg:col-span-2 space-y-6">
              {spendingChartData && (
                <EChartCard
                  title="Rental Spending Activity"
                  subtitle="Trip expenses across your rental history"
                  options={spendingChartData}
                  height="250px"
                />
              )}

              <div className="flex justify-between items-center">
                <h2
                  className="text-xl font-black uppercase tracking-widest opacity-70"
                  style={{ color: theme.text }}
                >
                  Recommended For You
                </h2>
                <button
                  onClick={() => navigate("/browsecars")}
                  className="text-green-500 text-sm font-black flex items-center gap-2 hover:translate-x-1 transition-transform"
                >
                  EXPLORE ALL <ArrowRight size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {recommendedCars.length === 0 ? (
                  <div className="col-span-2 p-8 text-center text-slate-400 text-sm">
                    No recommendations currently available
                  </div>
                ) : (
                  recommendedCars.slice(0, 2).map((car) => (
                    <CarCard
                      key={car._id}
                      name={car.name || `${car.brand} ${car.model}`}
                      price={`₹${(car.pricePerDay || 2200).toLocaleString()}`}
                      tag={car.category?.toUpperCase() || 'VERIFIED'}
                      image={car.primaryImage || car.images?.[0] || PorscheImg}
                      specs={`${car.year} • ${car.transmission} • ${car.fuelType}`}
                      carId={car._id}
                      theme={theme}
                    />
                  ))
                )}
              </div>
            </div>

            {/* RECENT ACTIVITY SECTION */}
            <div
              className="rounded-3xl p-8 border shadow-xl h-fit"
              style={{
                backgroundColor: theme.cardBg,
                borderColor: theme.border
              }}
            >
              <h2
                className="text-xl font-black uppercase tracking-widest mb-8 border-b pb-4"
                style={{
                  color: theme.text,
                  borderColor: theme.border
                }}
              >
                Timeline
              </h2>

              <div className="space-y-8">
                {recentActivity.length > 0 ? (
                  recentActivity.map((item, idx) => (
                    <ActivityItem
                      key={idx}
                      title={item.title}
                      sub={item.sub}
                      status={item.status}
                      theme={theme}
                    />
                  ))
                ) : (
                  <p className="text-sm text-center opacity-50" style={{ color: theme.textSecondary }}>
                    No recent activity
                  </p>
                )}
              </div>

              <button
                onClick={() => navigate('/mybookings')}
                className="w-full mt-10 py-4 text-sm font-black rounded-2xl border transition-colors hover:bg-opacity-80"
                style={{
                  backgroundColor: theme.inputBg,
                  borderColor: theme.border,
                  color: theme.textSecondary
                }}
              >
                VIEW ALL ACTIVITY
              </button>
            </div>
          </div>
        </main>

        {/* FLOAT ACTION - AI Assistant button */}
        <button
          type="button"
          onClick={() => navigate("/aiassistant")}
          className="
            fixed bottom-10 right-10 z-50
            w-16 h-16 rounded-3xl
            bg-green-500 text-white
            flex items-center justify-center
            shadow-2xl shadow-green-500/40
            hover:scale-110 hover:-translate-y-2 transition-all duration-300
          "
        >
          <Sparkles size={28} />
        </button>
      </div>
    </>
  );
};

/* =========================
   SUB COMPONENTS
========================= */

const StatCard = ({ title, value, sub, icon, theme }) => (
  <div
    className="rounded-3xl p-8 border shadow-xl flex items-start justify-between group hover:border-green-500/50 transition-colors"
    style={{
      backgroundColor: theme.cardBg,
      borderColor: theme.border
    }}
  >
    <div>
      <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: theme.textSecondary }}>
        {title}
      </p>
      <h3 className="text-3xl font-black" style={{ color: theme.text }}>
        {value}
      </h3>
      <p className="text-xs text-green-500 font-bold mt-3 bg-green-500/5 inline-block px-2 py-1 rounded-lg">
        {sub}
      </p>
    </div>
    <div
      className="p-3 rounded-2xl group-hover:bg-green-500/10 transition-colors"
      style={{ backgroundColor: theme.inputBg }}
    >
      {icon}
    </div>
  </div>
);

const QuickAction = ({ icon, label, onClick, theme, highlight }) => (
  <button
    onClick={onClick}
    className={`rounded-3xl p-8 flex flex-col items-center gap-4 border shadow-xl hover:translate-y-[-8px] transition-all group ${highlight ? 'hover:border-orange-500' : 'hover:border-green-500'
      }`}
    style={{
      backgroundColor: theme.cardBg,
      borderColor: highlight ? 'rgba(249, 115, 22, 0.3)' : theme.border
    }}
  >
    <div
      className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-inner ${highlight
        ? 'group-hover:bg-orange-500 group-hover:text-white'
        : 'group-hover:bg-green-500 group-hover:text-white'
        }`}
      style={{
        backgroundColor: highlight ? 'rgba(249, 115, 22, 0.1)' : theme.inputBg,
        color: highlight ? '#f97316' : theme.textSecondary
      }}
    >
      {React.cloneElement(icon, { size: 28 })}
    </div>
    <span className="text-sm font-black uppercase tracking-widest" style={{ color: theme.text }}>
      {label}
    </span>
  </button>
);

const CarCard = ({ name, price, tag, image, specs, theme }) => {
  const navigate = useNavigate();

  const handleBookNow = () => {
    navigate('/browsecars');
  };

  return (
    <div
      className="group rounded-3xl overflow-hidden border shadow-xl hover:shadow-2xl hover:border-green-500/50 transition-all duration-500 flex flex-col"
      style={{
        backgroundColor: theme.cardBg,
        borderColor: theme.border
      }}
    >
      <div
        className="h-56 flex items-center justify-center relative p-6"
        style={{ backgroundColor: theme.inputBg }}
      >
        <img
          src={image}
          alt={name}
          className="h-full object-contain group-hover:scale-110 transition-transform duration-700"
        />
        <span className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1.5 rounded-xl font-black text-[10px] tracking-widest shadow-lg shadow-green-500/20">
          {tag}
        </span>
      </div>

      <div className="p-8 space-y-4 flex-1 flex flex-col justify-between">
        <div>
          <h3
            className="text-2xl font-black group-hover:text-green-500 transition-colors"
            style={{ color: theme.text }}
          >
            {name}
          </h3>
          <p className="text-sm font-medium mt-1" style={{ color: theme.textSecondary }}>
            {specs}
          </p>
        </div>

        <div
          className="flex justify-between items-center pt-6 border-t"
          style={{ borderColor: theme.border }}
        >
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: theme.textSecondary }}>
              Daily Fare
            </p>
            <p className="text-2xl font-black text-green-500">
              {price}
            </p>
          </div>
          <button
            onClick={handleBookNow}
            className="px-6 py-3 rounded-xl text-xs font-black text-white bg-gray-900 hover:bg-green-500 transition-all shadow-lg active:scale-95"
          >
            BOOK NOW
          </button>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ title, sub, status, theme }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'primary': return 'bg-green-500';
      case 'info': return 'bg-blue-500';
      case 'warning': return 'bg-orange-500';
      default: return theme.border;
    }
  };

  return (
    <div className="flex items-start gap-4 relative">
      <div className={`mt-1.5 w-3 h-3 rounded-full flex-shrink-0 z-10 ${getStatusColor()} shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
      <div className="space-y-1">
        <p className="text-sm font-black leading-none uppercase tracking-wide" style={{ color: theme.text }}>
          {title}
        </p>
        <p className="text-xs font-medium tracking-tight opacity-75" style={{ color: theme.textSecondary }}>
          {sub}
        </p>
      </div>
    </div>
  );
};

export default AppDashboard;

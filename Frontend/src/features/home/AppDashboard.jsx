import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
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
  AlertCircle,
  ShieldCheck
} from "lucide-react";
import { bookingService } from '@/features/bookings/bookingService';
import damageService from '@/features/damage/damageService';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import EChartCard from "@/components/ui/EChartCard";
import { carService } from '@/features/cars/carService';
import { getCarImageUrl } from '@/features/cars/carImageMap';
import { CountUp } from '@/components/fx';

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
  }, [isDarkMode]);

  const fetchDashboardData = async () => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const firstName = user.name ? user.name.split(' ')[0] : 'Guest';
        setUserName(firstName);
      }

      // Fetch user bookings and damage reports
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
          title: 'Trip Payment Due',
          car: b.car ? `${b.car.brand} ${b.car.model}` : 'Unknown Vehicle',
          amount: b.totalPrice,
          link: '/payment',
          data: {
            bookingId: b._id,
            carId: b.car?._id,
            carName: b.car ? `${b.car.brand} ${b.car.model}` : 'Unknown Vehicle',
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
          title: 'Damage Claim Assessment',
          car: d.car ? `${d.car.brand} ${d.car.model}` : 'Unknown Vehicle',
          amount: d.actualCost,
          link: '/payment',
          data: {
            damageReportId: d._id,
            carId: d.car?._id,
            carName: d.car ? `${d.car.brand} ${d.car.model}` : 'Unknown Vehicle',
            actualCost: d.actualCost,
            bookingId: d.booking?._id || d.booking
          }
        });
      });

      setPendingItems(items);

      // Find current active rental
      const now = new Date();
      const current = bookings.find(b =>
        b.status === 'confirmed' &&
        new Date(b.endDate) > now &&
        new Date(b.startDate) <= now
      );

      if (current) {
        setCurrentRental({
          name: current.car ? `${current.car.brand} ${current.car.model}` : 'Active Vehicle',
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

      // Generate Spending Analytics Chart in Terracotta & Copper
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
              axisLine: { lineStyle: { color: isDarkMode ? 'rgba(243, 238, 229, 0.2)' : '#D8CBB8' } },
              axisLabel: { color: isDarkMode ? '#B3AA9C' : '#6B6459', fontSize: 11 }
            },
            yAxis: {
              type: 'value',
              axisLabel: { formatter: '₹{value}', color: isDarkMode ? '#B3AA9C' : '#6B6459', fontSize: 11 },
              splitLine: { lineStyle: { color: isDarkMode ? 'rgba(243, 238, 229, 0.08)' : '#E8E0D3' } }
            },
            series: [{
              data: tripAmounts,
              type: 'bar',
              itemStyle: {
                color: isDarkMode ? '#B85D3B' : '#A34F32',
                borderRadius: [8, 8, 0, 0]
              }
            }]
          });
        }
      }

      // Generate Timeline Activity
      const activities = [];

      bookings.slice(0, 3).forEach(b => {
        activities.push({
          title: `Booking ${b.status.charAt(0).toUpperCase() + b.status.slice(1)}`,
          sub: `${b.car?.brand || 'Car'} ${b.car?.model || ''} • ${new Date(b.createdAt).toLocaleDateString()}`,
          status: b.status === 'confirmed' ? 'success' : 'info',
          date: new Date(b.createdAt)
        });
      });

      damages.slice(0, 3).forEach(d => {
        let status = 'info';
        let title = "Damage Report Filed";
        if (d.status === 'approved') {
          status = 'warning';
          title = "Damage Approved";
        } else if (d.status === 'rejected') {
          status = 'success';
          title = "Damage Dismissed";
        }

        activities.push({
          title: title,
          sub: `${d.car?.brand || 'Car'} ${d.car?.model || ''} • ${new Date(d.createdAt).toLocaleDateString()}`,
          status: status,
          date: new Date(d.createdAt)
        });
      });

      activities.sort((a, b) => b.date - a.date);
      setRecentActivity(activities.slice(0, 4));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  return (
    <>
      <DashboardNavbar />
      <div className="min-h-screen bg-bg transition-colors duration-300">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* WELCOME SECTION */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-text font-display">
                Welcome back, <span className="text-primary">{userName}</span>
              </h1>
              <p className="text-xs sm:text-sm text-text-muted">
                Your mobility garage is active. Where are you traveling today?
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/browsecars")}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-primary/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus size={16} /> New Booking
            </button>
          </div>

          {/* STATS SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <StatCard
              title="Current Rental"
              value={currentRental ? currentRental.name : "No Active Trip"}
              sub={currentRental ? `Return by ${currentRental.endDate}` : "Fleet ready to dispatch"}
              icon={<Car className="w-5 h-5 text-primary" />}
            />
            <StatCard
              title="Total Bookings"
              value={<CountUp to={stats.totalBookings} />}
              sub={`${stats.activeBookings} active reservations`}
              icon={<Calendar className="w-5 h-5 text-accent" />}
            />
            <StatCard
              title="Pending Actions"
              value={<CountUp to={stats.pendingPayments + stats.pendingDamages} />}
              sub="Payments & Inspections"
              icon={<AlertTriangle className="w-5 h-5 text-warning" />}
            />
          </div>

          {/* QUICK ACTIONS */}
          <div className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-subtle flex items-center gap-1.5 font-mono">
              <Zap size={14} className="text-primary" />
              <span>Quick Navigation</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <QuickAction
                icon={<Car />}
                label="Browse Fleet"
                onClick={() => navigate("/browsecars")}
              />
              <QuickAction
                icon={<Calendar />}
                label="My Bookings"
                onClick={() => navigate("/mybookings")}
              />
              <QuickAction
                icon={<AlertTriangle />}
                label="Damage Reports"
                onClick={() => navigate("/mybookings")}
                highlight={stats.pendingDamages > 0}
              />
              <QuickAction
                icon={<CreditCard />}
                label="Payment Hub"
                onClick={() => navigate("/payment")}
                highlight={stats.pendingPayments > 0}
              />
            </div>
          </div>

          {/* ACTION ITEMS SECTION */}
          {pendingItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-danger flex items-center gap-1.5 font-mono">
                <AlertCircle size={14} />
                <span>Action Required ({pendingItems.length})</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl p-4 border border-danger/30 bg-surface shadow-xs flex items-center justify-between transition-all"
                  >
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-danger uppercase tracking-wider">Pending Action</p>
                      <h4 className="font-bold text-xs text-text">{item.title}</h4>
                      <p className="text-[11px] text-text-muted">{item.car}</p>
                      <p className="text-sm font-black text-primary font-mono tabular-nums">₹{item.amount?.toLocaleString('en-IN')}</p>
                    </div>
                    <button
                      onClick={() => navigate(item.link, { state: item.data })}
                      className="p-2.5 rounded-xl bg-danger hover:bg-danger/90 text-white shadow-xs transition-all hover:scale-105 active:scale-95"
                    >
                      <ArrowRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MAIN LAYOUT GRID */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* USER ANALYTICS & RECOMMENDED SECTION */}
            <div className="lg:col-span-2 space-y-6">
              {spendingChartData && (
                <EChartCard
                  title="Rental Spending Activity"
                  subtitle="Expenses across recent rental trips"
                  options={spendingChartData}
                  height="250px"
                />
              )}

              <div className="flex justify-between items-center">
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-subtle font-mono">
                  Recommended For You
                </h2>
                <button
                  onClick={() => navigate("/browsecars")}
                  className="text-primary text-xs font-bold flex items-center gap-1 hover:translate-x-0.5 transition-transform"
                >
                  <span>Explore All</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedCars.length === 0 ? (
                  <div className="col-span-2 p-8 text-center text-text-muted text-xs bg-surface border border-border rounded-2xl">
                    No recommendations currently available
                  </div>
                ) : (
                  recommendedCars.slice(0, 2).map((car) => (
                    <DashboardCarCard
                      key={car._id}
                      car={car}
                    />
                  ))
                )}
              </div>
            </div>

            {/* RECENT ACTIVITY TIMELINE */}
            <div className="rounded-2xl p-5 border border-border bg-surface shadow-xs h-fit space-y-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text font-mono border-b border-border pb-3">
                Recent Activity
              </h2>

              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((item, idx) => (
                    <ActivityItem
                      key={idx}
                      title={item.title}
                      sub={item.sub}
                      status={item.status}
                    />
                  ))
                ) : (
                  <p className="text-xs text-center text-text-subtle py-4">
                    No recent activity records
                  </p>
                )}
              </div>

              <button
                onClick={() => navigate('/mybookings')}
                className="w-full mt-4 py-2.5 text-xs font-semibold rounded-xl border border-border bg-surface-sunken hover:bg-surface text-text-muted hover:text-text transition-colors"
              >
                View All Activity
              </button>
            </div>
          </div>
        </main>

        {/* FLOAT ACTION - AI Assistant */}
        <button
          type="button"
          onClick={() => navigate("/aiassistant")}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:scale-110 active:scale-95 transition-all duration-200"
          title="Open AI Vehicle Assistant"
          aria-label="AI Assistant"
        >
          <Sparkles size={24} />
        </button>
      </div>
    </>
  );
};

const StatCard = ({ title, value, sub, icon }) => (
  <div className="rounded-2xl p-5 border border-border bg-surface shadow-xs flex items-start justify-between group hover:border-primary/40 transition-colors">
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-text-subtle mb-1">
        {title}
      </p>
      <h3 className="text-2xl font-black text-text font-display">
        {value}
      </h3>
      <p className="text-xs text-primary font-semibold mt-2 bg-primary-soft inline-block px-2 py-0.5 rounded-lg border border-primary/20">
        {sub}
      </p>
    </div>
    <div className="p-2.5 rounded-xl bg-surface-sunken group-hover:bg-primary-soft transition-colors shrink-0">
      {icon}
    </div>
  </div>
);

const QuickAction = ({ icon, label, onClick, highlight }) => (
  <button
    onClick={onClick}
    className={`rounded-2xl p-4 flex flex-col items-center gap-2.5 border shadow-xs hover:-translate-y-1 transition-all group bg-surface ${
      highlight ? 'border-warning/40 hover:border-warning' : 'border-border hover:border-primary/40'
    }`}
  >
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
        highlight
          ? 'bg-warning-soft text-warning group-hover:bg-warning group-hover:text-white'
          : 'bg-surface-sunken text-text-muted group-hover:bg-primary group-hover:text-white'
      }`}
    >
      {React.cloneElement(icon, { size: 22 })}
    </div>
    <span className="text-xs font-semibold text-text">
      {label}
    </span>
  </button>
);

const DashboardCarCard = ({ car }) => {
  const navigate = useNavigate();
  const image = getCarImageUrl(car);

  return (
    <div className="group rounded-2xl overflow-hidden border border-border bg-surface shadow-xs hover:border-primary/40 transition-all flex flex-col">
      <div className="aspect-[16/10] flex items-center justify-center relative p-3 bg-surface-sunken/60 overflow-hidden">
        <img
          src={image}
          alt={car.name || `${car.brand} ${car.model}`}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-2.5 left-2.5 bg-primary-soft border border-primary/20 text-primary px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider">
          {car.category || 'Featured'}
        </span>
      </div>

      <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-sm font-bold text-text font-display group-hover:text-primary transition-colors line-clamp-1">
            {car.name || `${car.brand} ${car.model}`}
          </h3>
          <p className="text-[11px] text-text-muted mt-0.5">
            {car.year || '2023'} • {car.transmission || 'Manual'} • {car.fuelType || 'Petrol'}
          </p>
        </div>

        <div className="flex justify-between items-center pt-3 border-t border-border">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-text-subtle">Daily Fare</p>
            <p className="text-base font-black text-primary font-mono tabular-nums">
              ₹{(car.pricePerDay || 2200).toLocaleString('en-IN')}
            </p>
          </div>
          <button
            onClick={() => navigate(`/car/${car._id}`)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary-hover transition-all shadow-xs"
          >
            Rent Now
          </button>
        </div>
      </div>
    </div>
  );
};

const ActivityItem = ({ title, sub, status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'success': return 'bg-success';
      case 'warning': return 'bg-warning';
      default: return 'bg-primary';
    }
  };

  return (
    <div className="flex items-start gap-3">
      <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${getBadgeStyle()}`} />
      <div className="space-y-0.5 min-w-0">
        <p className="text-xs font-bold text-text leading-tight">{title}</p>
        <p className="text-[11px] text-text-muted truncate">{sub}</p>
      </div>
    </div>
  );
};

export default AppDashboard;

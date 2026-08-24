'use client';

import React, { useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartData,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { useCountUp } from '@/hooks/useCountUp';
import { Product } from '@/data/products';
import { Order } from '@/features/admin/data/adminMockData';
import { Customer } from '@/features/customers/types/customers.types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardOverviewProps {
  animKey: number;
  productsList: Product[];
  ordersList?: Order[];
  customersList?: Customer[];
}

export default function DashboardOverview({
  animKey,
  productsList = [],
  ordersList = [],
  customersList = [],
}: DashboardOverviewProps) {
  const chartRef = useRef<ChartJS<'line'>>(null);

  // Helper: Filter orders that are actually PAID or COMPLETED
  const paidOrdersList = useMemo(() => {
    return ordersList.filter(o => o.paymentStatus === 'paid' || o.shippingStatus === 'completed');
  }, [ordersList]);

  // 1. Compute Real KPI Metrics
  const totalRevenue = useMemo(() => {
    // Only calculate revenue from PAID / COMPLETED orders
    return paidOrdersList.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  }, [paidOrdersList]);

  const totalOrdersCount = useMemo(() => {
    return ordersList.length;
  }, [ordersList]);

  const paidOrdersCount = useMemo(() => {
    return paidOrdersList.length;
  }, [paidOrdersList]);

  const totalProductsCount = useMemo(() => {
    return productsList.length;
  }, [productsList]);

  const inStockProductsCount = useMemo(() => {
    return productsList.filter(p => p.inStock !== false).length;
  }, [productsList]);

  const totalCustomersCount = useMemo(() => {
    return customersList.length;
  }, [customersList]);

  const activeCustomersCount = useMemo(() => {
    return customersList.filter(c => c.status === 'active').length;
  }, [customersList]);

  // Count-up Animated Metrics (with real values)
  const animatedRevenue = useCountUp(totalRevenue, 1600, animKey);
  const animatedOrders = useCountUp(totalOrdersCount, 1600, animKey);
  const animatedProducts = useCountUp(totalProductsCount, 1600, animKey);
  const animatedCustomers = useCountUp(totalCustomersCount, 1600, animKey);

  // 2. Real Line Chart Data: Monthly revenue aggregated ONLY from PAID orders
  const lineChartData: ChartData<'line'> = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const months = ['Thg 1', 'Thg 2', 'Thg 3', 'Thg 4', 'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8', 'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'];
    const monthlyTotals = new Array(12).fill(0);

    paidOrdersList.forEach(o => {
      let d: Date | null = null;
      if (o.rawDate) {
        d = new Date(o.rawDate);
      } else if (o.date) {
        const parts = o.date.match(/(\d{2})\/(\d{2})\/(\d{4})/);
        if (parts) {
          d = new Date(`${parts[3]}-${parts[2]}-${parts[1]}`);
        } else {
          d = new Date(o.date);
        }
      }

      if (d && !isNaN(d.getTime())) {
        const m = d.getMonth();
        if (m >= 0 && m < 12) {
          monthlyTotals[m] += Number(o.total || 0);
        }
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Doanh thu đã thanh toán (VNĐ)',
          data: monthlyTotals,
          borderColor: '#2e7d32',
          borderWidth: 3.5,
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return 'rgba(46, 125, 50, 0.2)';
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, 'rgba(46, 125, 50, 0.35)');
            gradient.addColorStop(1, 'rgba(46, 125, 50, 0.0)');
            return gradient;
          },
          fill: true,
          tension: 0.38,
          pointRadius: 6,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#2e7d32',
          pointBorderWidth: 3,
          pointHoverRadius: 9,
          pointHoverBackgroundColor: '#2e7d32',
          pointHoverBorderColor: '#ffffff',
        },
      ],
    };
  }, [paidOrdersList, animKey]);

  const lineChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animations: {
        y: {
          type: 'number' as const,
          easing: 'easeInOutBack' as const,
          duration: 1000,
          delay(ctx: any) {
            if (ctx.type !== 'data') return 0;
            return ctx.index * 110;
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => `Doanh thu đã thanh toán: ${Number(context.raw || 0).toLocaleString('vi-VN')}đ`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (val: any) => {
              if (val >= 1000000) return (val / 1000000).toFixed(1).replace('.0', '') + ' Tr';
              if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
              return val;
            },
          },
          grid: { color: '#f1f5f9' },
        },
        x: { grid: { display: false } },
      },
    };
  }, [animKey]);

  // 3. Real Doughnut Chart Data: Revenue aggregated STRICTLY by category from PAID orders only
  const { doughnutChartData, hasCategoryData } = useMemo(() => {
    const catMap: Record<string, { name: string; revenue: number; color: string }> = {};

    const defaultColors: Record<string, string> = {
      'noi-that': '#2e7d32',
      'den': '#2563eb',
      'trang-tri': '#f59e0b',
      'decor': '#f59e0b',
      'luu-tru': '#8b5cf6',
      'gom-su': '#ec4899',
      'nha-bep': '#06b6d4',
      'do-my-nghe': '#d97706',
      'may-tre-dan': '#10b981',
    };
    const fallbackPalette = ['#2e7d32', '#2563eb', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#d97706', '#10b981', '#64748b'];

    // Map each product to its category
    const productCategoryLookup = new Map<string, { cat: string; catName: string }>();
    productsList.forEach((p) => {
      const cat = p.category || 'decor';
      const catName = p.categoryName || cat;
      productCategoryLookup.set(String(p.id), { cat, catName });
      if (p.name) {
        productCategoryLookup.set(p.name.toLowerCase().trim(), { cat, catName });
      }
    });

    // Accumulate revenue ONLY from PAID orders
    paidOrdersList.forEach(order => {
      (order.items || []).forEach(item => {
        const lookup = productCategoryLookup.get(String(item.productId)) || productCategoryLookup.get(item.productName?.toLowerCase().trim());
        const cat = lookup?.cat || 'decor';
        const catName = lookup?.catName || 'Khác';
        if (!catMap[cat]) {
          catMap[cat] = {
            name: catName,
            revenue: 0,
            color: defaultColors[cat] || fallbackPalette[Object.keys(catMap).length % fallbackPalette.length],
          };
        }
        catMap[cat].revenue += (Number(item.price) || 0) * (Number(item.quantity) || 1);
      });
    });

    const activeCats = Object.values(catMap).filter(c => c.revenue > 0);
    const hasData = activeCats.length > 0;

    const labels = activeCats.map(c => c.name);
    const data = activeCats.map(c => c.revenue);
    const bgColors = activeCats.map(c => c.color);

    const chartData: ChartData<'doughnut'> = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: bgColors,
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverOffset: 12,
        },
      ],
    };

    return { doughnutChartData: chartData, hasCategoryData: hasData };
  }, [productsList, paidOrdersList, animKey]);

  const doughnutChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 1800,
        easing: 'easeOutBack' as const,
      },
      animations: {
        numbers: {
          type: 'number' as const,
          properties: ['circumference', 'endAngle'],
          easing: 'easeInOutBack' as const,
          duration: 1200,
          delay(ctx: any) {
            if (ctx.type !== 'data') return 0;
            return ctx.index * 160;
          },
        },
      },
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: {
            font: { family: 'Plus Jakarta Sans', size: 11, weight: 700 },
            padding: 16,
            usePointStyle: true,
            pointStyle: 'circle' as const,
          },
        },
        tooltip: {
          callbacks: {
            label: (context: any) => ` ${context.label}: ${Number(context.raw || 0).toLocaleString('vi-VN')}đ`,
          },
        },
      },
      cutout: '65%',
    };
  }, [animKey]);

  // 4. Real Top 10 Best Sellers Bar Chart: ONLY from PAID orders
  const { top10ProductsData, hasTop10Data } = useMemo(() => {
    const prodSalesMap = new Map<string, { name: string; revenue: number; soldCount: number }>();

    // Accumulate sales STRICTLY from PAID orders
    paidOrdersList.forEach(order => {
      (order.items || []).forEach(item => {
        const key = String(item.productId || item.productName);
        const existing = prodSalesMap.get(key);
        const itemRev = (Number(item.price) || 0) * (Number(item.quantity) || 1);
        const itemQty = Number(item.quantity) || 1;
        if (existing) {
          existing.revenue += itemRev;
          existing.soldCount += itemQty;
        } else {
          prodSalesMap.set(key, {
            name: item.productName || 'Sản phẩm',
            revenue: itemRev,
            soldCount: itemQty,
          });
        }
      });
    });

    const sortedProds = Array.from(prodSalesMap.values()).filter(p => p.revenue > 0).sort((a, b) => b.revenue - a.revenue);
    const top10 = sortedProds.slice(0, 10);
    const hasData = top10.length > 0;

    const chartData: ChartData<'bar'> = {
      labels: top10.map(p => p.name.length > 16 ? p.name.substring(0, 16) + '...' : p.name),
      datasets: [
        {
          label: 'Doanh thu (VNĐ)',
          data: top10.map(p => p.revenue),
          backgroundColor: (context) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return '#10b981';
            const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, '#047857');
            gradient.addColorStop(0.5, '#10b981');
            gradient.addColorStop(1, '#34d399');
            return gradient;
          },
          hoverBackgroundColor: '#065f46',
          borderRadius: 6,
          borderWidth: 0,
          barPercentage: 0.5,
          categoryPercentage: 0.8,
        }
      ]
    };

    return { top10ProductsData: chartData, hasTop10Data: hasData };
  }, [paidOrdersList]);

  const top10ChartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      animations: {
        y: {
          type: 'number' as const,
          easing: 'easeOutBack' as const,
          duration: 1400,
          delay(ctx: any) {
            if (ctx.type !== 'data') return 0;
            return ctx.index * 120;
          },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context: any) => `Doanh thu: ${Number(context.raw || 0).toLocaleString('vi-VN')}đ`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (val: any) => {
              if (val >= 1000000) return (val / 1000000).toFixed(1).replace('.0', '') + ' Tr';
              if (val >= 1000) return (val / 1000).toFixed(0) + 'k';
              return Number(val).toLocaleString('vi-VN');
            },
            font: { family: 'Plus Jakarta Sans', size: 10, weight: 600 },
          },
          grid: { color: '#f1f5f9' },
        },
        x: {
          ticks: {
            font: { family: 'Plus Jakarta Sans', size: 9, weight: 700 },
          },
          grid: { display: false },
        },
      },
    };
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <div className="admin-tab-page" id="tab-overview">
      {/* 4 KPI CARDS ROW (4 SQUARE CARDS) */}
      <section className="kpi-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* KPI Card 1: Total Revenue */}
        <div className="kpi-card kpi-card-animated" key={`kpi-1-${animKey}`} style={{ animationDelay: '0ms', borderRadius: '20px', padding: '24px 20px' }}>
          <div className="kpi-header">
            <span className="kpi-title">Doanh thu thực nhận</span>
            <div className="kpi-icon-box">
              <i className="fa-solid fa-sack-dollar"></i>
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: '1.85rem', fontWeight: 800, margin: '8px 0' }}>
            {animatedRevenue.toLocaleString('vi-VN')}đ
          </div>
          <div className="kpi-trend" style={{ color: 'var(--primary-color)' }}>
            <i className="fa-solid fa-circle-check"></i>
            <span>{paidOrdersCount}/{totalOrdersCount} đơn đã thanh toán thành công</span>
          </div>
        </div>

        {/* KPI Card 2: Orders */}
        <div className="kpi-card kpi-card-animated" key={`kpi-2-${animKey}`} style={{ animationDelay: '100ms', borderRadius: '20px', padding: '24px 20px' }}>
          <div className="kpi-header">
            <span className="kpi-title">Tổng số đơn hàng</span>
            <div className="kpi-icon-box">
              <i className="fa-solid fa-cart-shopping"></i>
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: '1.85rem', fontWeight: 800, margin: '8px 0' }}>
            {animatedOrders} đơn
          </div>
          <div className="kpi-trend">
            <i className="fa-solid fa-shield-check"></i>
            <span>Dữ liệu thực từ Supabase</span>
          </div>
        </div>

        {/* KPI Card 3: Products */}
        <div className="kpi-card kpi-card-animated" key={`kpi-3-${animKey}`} style={{ animationDelay: '200ms', borderRadius: '20px', padding: '24px 20px' }}>
          <div className="kpi-header">
            <span className="kpi-title">Tổng sản phẩm</span>
            <div className="kpi-icon-box">
              <i className="fa-solid fa-boxes-stacked"></i>
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: '1.85rem', fontWeight: 800, margin: '8px 0' }}>
            {animatedProducts} món
          </div>
          <div className="kpi-trend" style={{ color: 'var(--primary-color)' }}>
            <i className="fa-solid fa-box-open"></i>
            <span>{inStockProductsCount} sản phẩm sẵn hàng</span>
          </div>
        </div>

        {/* KPI Card 4: Customers */}
        <div className="kpi-card kpi-card-animated" key={`kpi-4-${animKey}`} style={{ animationDelay: '300ms', borderRadius: '20px', padding: '24px 20px' }}>
          <div className="kpi-header">
            <span className="kpi-title">Khách hàng</span>
            <div className="kpi-icon-box">
              <i className="fa-solid fa-users-viewfinder"></i>
            </div>
          </div>
          <div className="kpi-value" style={{ fontSize: '1.85rem', fontWeight: 800, margin: '8px 0' }}>
            {animatedCustomers.toLocaleString('vi-VN')} người
          </div>
          <div className="kpi-trend">
            <i className="fa-solid fa-user-check"></i>
            <span>{activeCustomersCount} tài khoản hoạt động</span>
          </div>
        </div>
      </section>

      {/* CHARTS GRID */}
      <section className="charts-grid">
        {/* Line Chart Card */}
        <div className="chart-card chart-card-animated" key={`chart-line-card-${animKey}`} style={{ animationDelay: '350ms' }}>
          <div className="chart-header">
            <div className="chart-title-group">
              <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-chart-line" style={{ color: '#2e7d32' }}></i>
                <span>Doanh thu theo các tháng ({currentYear})</span>
              </h3>
              <span className="chart-subtitle">Thống kê tổng doanh thu từ các đơn hàng đã thanh toán thành công</span>
            </div>
          </div>

          <div className="chart-container">
            <Line ref={chartRef} key={`line-canvas-${animKey}`} data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Doughnut Chart Card */}
        <div className="chart-card chart-card-animated" key={`chart-doughnut-card-${animKey}`} style={{ animationDelay: '450ms' }}>
          <div className="chart-header">
            <div className="chart-title-group">
              <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <i className="fa-solid fa-chart-pie" style={{ color: '#2563eb' }}></i>
                <span>Doanh thu theo danh mục</span>
              </h3>
              <span className="chart-subtitle">Tỷ trọng doanh thu thực tế từ các đơn hàng đã thanh toán</span>
            </div>
          </div>

          <div className="chart-container doughnut-chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {hasCategoryData ? (
              <Doughnut key={`doughnut-canvas-${animKey}`} data={doughnutChartData} options={doughnutChartOptions} />
            ) : (
              <div style={{ textAlign: 'center', color: '#64748b', padding: '30px 20px' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <i className="fa-solid fa-chart-pie" style={{ fontSize: '1.5rem', color: '#94a3b8' }}></i>
                </div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>Chưa có doanh thu thanh toán</h4>
                <p style={{ fontSize: '0.825rem', color: '#64748b', maxWidth: '280px', margin: '0 auto' }}>Tỷ trọng ngành hàng sẽ tự động phân tích khi có đơn hàng được thanh toán.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Full-width Bar Chart: Top 10 Best Sellers */}
      <div 
        className="chart-card chart-card-animated" 
        key={`chart-bar-card-${animKey}`} 
        style={{ animationDelay: '550ms', marginTop: '24px' }}
      >
        <div className="chart-header">
          <div className="chart-title-group">
            <h3 className="chart-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-chart-column" style={{ color: '#10b981' }}></i>
              <span>Top 10 Sản Phẩm Doanh Thu Cao Nhất 🚀</span>
            </h3>
            <span className="chart-subtitle">Thống kê doanh thu từ các sản phẩm trong đơn hàng đã thanh toán</span>
          </div>
        </div>

        <div className="chart-container" style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {hasTop10Data ? (
            <Bar key={`bar-canvas-${animKey}`} data={top10ProductsData} options={top10ChartOptions} />
          ) : (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 20px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <i className="fa-solid fa-chart-column" style={{ fontSize: '1.75rem', color: '#94a3b8' }}></i>
              </div>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>Chưa có sản phẩm nào được thanh toán</h4>
              <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '360px', margin: '0 auto' }}>Top 10 sản phẩm bán chạy sẽ xếp hạng ngay khi đơn hàng chuyển sang trạng thái đã thanh toán / hoàn tất.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

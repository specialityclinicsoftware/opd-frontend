import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryService } from '../../services';
import type { InventoryItem, InventoryStats } from '../../types';
import { useAuth } from '../../context/AuthContext';

const PharmacyInventory = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'low-stock' | 'expiring'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);

  console.log({ stats });

  const loadData = useCallback(async (searchQuery?: string, resetPage = false) => {
    if (!user?.hospitalId) return;

    try {
      setLoading(true);
      setError('');

      const pageToUse = resetPage ? 1 : currentPage;
      if (resetPage) {
        setCurrentPage(1);
      }

      // Load stats (only when not searching)
      if (!searchQuery?.trim()) {
        const statsResponse = await inventoryService.getStats(user.hospitalId);
        setStats(statsResponse.data);
      }

      // Load inventory based on filter with search term
      const search = searchQuery?.trim() || undefined;
      let response;
      if (filterType === 'low-stock') {
        response = await inventoryService.getLowStock(
          user.hospitalId,
          search,
          pageToUse,
          itemsPerPage
        );
      } else if (filterType === 'expiring') {
        response = await inventoryService.getExpiring(
          user.hospitalId,
          search,
          pageToUse,
          itemsPerPage
        );
      } else {
        response = await inventoryService.getByHospital(
          user.hospitalId,
          search,
          pageToUse,
          itemsPerPage
        );
      }

      console.log('Loaded inventory:', response.data.inventory);

      setInventory(response.data.inventory);

      // Update pagination state
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.totalPages);
        setTotalItems(response.data.pagination.total);
      } else {
        // Fallback if pagination is not provided
        setTotalPages(1);
        setTotalItems(response.data.inventory.length);
      }
    } catch (err) {
      console.error('Load inventory error:', err);
      setError('Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [user?.hospitalId, currentPage, filterType, itemsPerPage]);

  // Load data when filter type or page changes
  useEffect(() => {
    if (user?.hospitalId) {
      loadData();
    }
  }, [user?.hospitalId, filterType, currentPage, loadData]);

  const handleSearch = () => {
    loadData(searchTerm, true); // Reset to page 1 when searching
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await inventoryService.delete(id);
      loadData();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete item');
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  };

  const isExpiringSoon = (expiryDate: Date | string) => {
    const days = Math.ceil(
      (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days <= 90 && days > 0;
  };

  const isExpired = (expiryDate: Date | string) => {
    return new Date(expiryDate) < new Date();
  };

  const isLowStock = (item: InventoryItem) => {
    return item.quantity <= item.minStockLevel;
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <svg
            style={styles.spinner}
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#3b82f6"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              strokeWidth="3"
              strokeDasharray="31.4 31.4"
              strokeLinecap="round"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 12 12"
                to="360 12 12"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
          <p style={styles.loadingText}>Loading inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header with Stats */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Pharmacy Inventory</h1>
          <p style={styles.subtitle}>{totalItems} items</p>
        </div>
        <button onClick={() => navigate('/pharmacy/add')} style={styles.addButton}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Medicine
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statIcon} data-color="blue">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M20 7h-9" />
                <path d="M14 17H5" />
                <circle cx="17" cy="17" r="3" />
                <circle cx="7" cy="7" r="3" />
              </svg>
            </div>
            <div style={styles.statContent}>
              <p style={styles.statLabel}>Total Items</p>
              <h3 style={styles.statValue}>{stats.totalItems}</h3>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon} data-color="green">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div style={styles.statContent}>
              <p style={styles.statLabel}>Total Value</p>
              <h3 style={styles.statValue}>{formatCurrency(stats.totalValue)}</h3>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon} data-color="orange">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div style={styles.statContent}>
              <p style={styles.statLabel}>Low Stock</p>
              <h3 style={styles.statValue}>{stats.lowStockCount}</h3>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIcon} data-color="red">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div style={styles.statContent}>
              <p style={styles.statLabel}>Expiring Soon</p>
              <h3 style={styles.statValue}>{stats.expiredCount}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div style={styles.filtersBar}>
        <div style={styles.filterButtons}>
          <button
            onClick={() => setFilterType('all')}
            style={{
              ...styles.filterButton,
              ...(filterType === 'all' ? styles.filterButtonActive : {}),
            }}
          >
            All Items
          </button>
          <button
            onClick={() => setFilterType('low-stock')}
            style={{
              ...styles.filterButton,
              ...(filterType === 'low-stock' ? styles.filterButtonActive : {}),
            }}
          >
            Low Stock
          </button>
          <button
            onClick={() => setFilterType('expiring')}
            style={{
              ...styles.filterButton,
              ...(filterType === 'expiring' ? styles.filterButtonActive : {}),
            }}
          >
            Expiring Soon
          </button>
        </div>

        <div style={styles.searchContainer}>
          <div style={styles.searchBox}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#64748b"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, batch, or manufacturer..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              style={styles.searchInput}
            />
          </div>
          <button onClick={handleSearch} style={styles.searchButton}>
            Search
          </button>
        </div>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {/* Inventory Table */}
      {inventory.length === 0 ? (
        <div style={styles.emptyState}>
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#cbd5e0"
            strokeWidth="1.5"
          >
            <path d="M20 7h-9" />
            <path d="M14 17H5" />
            <circle cx="17" cy="17" r="3" />
            <circle cx="7" cy="7" r="3" />
          </svg>
          <h3 style={styles.emptyTitle}>No Items Found</h3>
          <p style={styles.emptyText}>
            {searchTerm ? 'Try adjusting your search' : 'Add your first medicine to get started'}
          </p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>#</th>
                <th style={styles.tableHeader}>Item Name</th>
                <th style={styles.tableHeader}>Generic Name</th>
                <th style={styles.tableHeader}>Batch No.</th>
                <th style={styles.tableHeader}>Quantity</th>
                <th style={styles.tableHeader}>Unit</th>
                <th style={styles.tableHeader}>Purchase Price</th>
                <th style={styles.tableHeader}>Selling Price</th>
                <th style={styles.tableHeader}>Expiry Date</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item, index) => (
                <tr key={item._id} style={styles.tableRow}>
                  <td style={styles.tableCell}>{index + 1}</td>
                  <td style={styles.tableCellBold}>
                    {item.itemName}
                    {item.manufacturer && <div style={styles.subText}>{item.manufacturer}</div>}
                  </td>
                  <td style={styles.tableCell}>{item.genericName || '-'}</td>
                  <td style={styles.tableCell}>{item.batchNumber}</td>
                  <td style={styles.tableCell}>
                    <span
                      style={{
                        ...styles.quantityBadge,
                        ...(isLowStock(item) ? styles.quantityBadgeLow : {}),
                      }}
                    >
                      {item.quantity}
                    </span>
                  </td>
                  <td style={styles.tableCell}>{item.unit}</td>
                  <td style={styles.tableCell}>{formatCurrency(item.purchasePrice)}</td>
                  <td style={styles.tableCell}>{formatCurrency(item.sellingPrice)}</td>
                  <td style={styles.tableCell}>
                    <span
                      style={{
                        ...styles.expiryDate,
                        ...(isExpired(item.expiryDate)
                          ? styles.expiryExpired
                          : isExpiringSoon(item.expiryDate)
                            ? styles.expiryExpiring
                            : {}),
                      }}
                    >
                      {formatDate(item.expiryDate)}
                    </span>
                  </td>
                  <td style={styles.tableCell}>
                    {isExpired(item.expiryDate) ? (
                      <span style={styles.statusExpired}>Expired</span>
                    ) : isLowStock(item) ? (
                      <span style={styles.statusLowStock}>Low Stock</span>
                    ) : isExpiringSoon(item.expiryDate) ? (
                      <span style={styles.statusExpiring}>Expiring</span>
                    ) : (
                      <span style={styles.statusActive}>In Stock</span>
                    )}
                  </td>
                  <td style={styles.tableCell}>
                    <div style={styles.actionButtons}>
                      <button
                        onClick={() => navigate(`/pharmacy/edit/${item._id}`)}
                        style={styles.actionButton}
                        title="Edit"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        style={{ ...styles.actionButton, ...styles.deleteButton }}
                        title="Delete"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Controls */}
      {inventory.length > 0 && totalPages > 1 && (
        <div style={styles.paginationContainer}>
          <div style={styles.paginationInfo}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} items
          </div>
          <div style={styles.paginationButtons}>
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              style={{
                ...styles.paginationButton,
                ...(currentPage === 1 ? styles.paginationButtonDisabled : {}),
              }}
              title="First Page"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="11 17 6 12 11 7" />
                <polyline points="18 17 13 12 18 7" />
              </svg>
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                ...styles.paginationButton,
                ...(currentPage === 1 ? styles.paginationButtonDisabled : {}),
              }}
              title="Previous Page"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            {/* Page Numbers */}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <button
                  key={pageNumber}
                  onClick={() => handlePageChange(pageNumber)}
                  style={{
                    ...styles.paginationButton,
                    ...(currentPage === pageNumber ? styles.paginationButtonActive : {}),
                  }}
                >
                  {pageNumber}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                ...styles.paginationButton,
                ...(currentPage === totalPages ? styles.paginationButtonDisabled : {}),
              }}
              title="Next Page"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              style={{
                ...styles.paginationButton,
                ...(currentPage === totalPages ? styles.paginationButtonDisabled : {}),
              }}
              title="Last Page"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="13 17 18 12 13 7" />
                <polyline points="6 17 11 12 6 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.25rem',
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
  },
  title: {
    fontSize: '1.75rem',
    margin: 0,
    marginBottom: '0.25rem',
    color: '#1e293b',
    fontWeight: '600' as const,
    letterSpacing: '-0.025em',
  },
  subtitle: {
    fontSize: '0.9375rem',
    margin: 0,
    color: '#64748b',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1.25rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9375rem',
    fontWeight: '600' as const,
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
    marginBottom: '1.25rem',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1.25rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    '&[data-color="blue"]': {
      backgroundColor: '#eff6ff',
      color: '#3b82f6',
    },
  } as React.CSSProperties,
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: '0.8125rem',
    color: '#64748b',
    margin: 0,
    marginBottom: '0.25rem',
    fontWeight: '500' as const,
  },
  statValue: {
    fontSize: '1.5rem',
    color: '#1e293b',
    margin: 0,
    fontWeight: '700' as const,
  },
  filtersBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.25rem',
    padding: '1rem 1.25rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  filterButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  filterButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    backgroundColor: '#f8fafc',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '500' as const,
    transition: 'all 0.2s ease',
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    flex: '0 0 auto',
    minWidth: '300px',
  },
  searchInput: {
    border: 'none',
    backgroundColor: 'transparent',
    outline: 'none',
    fontSize: '0.875rem',
    color: '#1e293b',
    width: '100%',
  },
  searchButton: {
    padding: '0.5rem 1.25rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '600' as const,
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap' as const,
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid #fecaca',
    fontSize: '0.9rem',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
  },
  spinner: {
    marginBottom: '1rem',
  },
  loadingText: {
    color: '#64748b',
    fontSize: '0.9375rem',
    margin: 0,
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '3rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  emptyTitle: {
    fontSize: '1.25rem',
    margin: '1rem 0 0.5rem',
    color: '#1e293b',
    fontWeight: '600' as const,
  },
  emptyText: {
    color: '#64748b',
    fontSize: '0.9375rem',
    margin: 0,
    textAlign: 'center' as const,
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    overflowX: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.875rem',
  },
  tableHeader: {
    padding: '0.875rem 1rem',
    textAlign: 'left' as const,
    fontWeight: '600' as const,
    fontSize: '0.75rem',
    color: '#475569',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e2e8f0',
    whiteSpace: 'nowrap' as const,
  },
  tableRow: {
    transition: 'background-color 0.2s ease',
    cursor: 'pointer',
  },
  tableCell: {
    padding: '0.875rem 1rem',
    borderBottom: '1px solid #e2e8f0',
    color: '#475569',
    fontSize: '0.875rem',
  },
  tableCellBold: {
    padding: '0.875rem 1rem',
    borderBottom: '1px solid #e2e8f0',
    color: '#1e293b',
    fontSize: '0.875rem',
    fontWeight: '600' as const,
  },
  subText: {
    fontSize: '0.75rem',
    color: '#64748b',
    marginTop: '0.125rem',
  },
  quantityBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.625rem',
    backgroundColor: '#f0fdf4',
    color: '#065f46',
    borderRadius: '6px',
    fontSize: '0.8125rem',
    fontWeight: '600' as const,
    border: '1px solid #d1fae5',
  },
  quantityBadgeLow: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderColor: '#fde68a',
  },
  expiryDate: {
    display: 'inline-block',
    fontSize: '0.875rem',
  },
  expiryExpiring: {
    color: '#d97706',
    fontWeight: '500' as const,
  },
  expiryExpired: {
    color: '#dc2626',
    fontWeight: '600' as const,
  },
  statusActive: {
    display: 'inline-block',
    padding: '0.375rem 0.75rem',
    backgroundColor: '#f0fdf4',
    color: '#065f46',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em',
    border: '1px solid #d1fae5',
  },
  statusLowStock: {
    display: 'inline-block',
    padding: '0.375rem 0.75rem',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em',
    border: '1px solid #fde68a',
  },
  statusExpiring: {
    display: 'inline-block',
    padding: '0.375rem 0.75rem',
    backgroundColor: '#fed7aa',
    color: '#92400e',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em',
    border: '1px solid #fdba74',
  },
  statusExpired: {
    display: 'inline-block',
    padding: '0.375rem 0.75rem',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.025em',
    border: '1px solid #fecaca',
  },
  actionButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  actionButton: {
    padding: '0.5rem',
    backgroundColor: '#f8fafc',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    color: '#dc2626',
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1.25rem',
    padding: '1rem 1.25rem',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  paginationInfo: {
    fontSize: '0.875rem',
    color: '#64748b',
    fontWeight: '500' as const,
  },
  paginationButtons: {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
  },
  paginationButton: {
    padding: '0.5rem 0.75rem',
    backgroundColor: '#f8fafc',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500' as const,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '40px',
  },
  paginationButtonActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6',
    fontWeight: '600' as const,
  },
  paginationButtonDisabled: {
    opacity: 0.4,
    cursor: 'not-allowed',
  },
};

export default PharmacyInventory;

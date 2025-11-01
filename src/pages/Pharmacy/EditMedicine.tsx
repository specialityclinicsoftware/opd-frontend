import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { inventoryService } from '../../services';
import type { InventoryFormData } from '../../types';

const EditMedicine = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<InventoryFormData>({
    itemName: '',
    genericName: '',
    manufacturer: '',
    batchNumber: '',
    quantity: 0,
    unit: 'tablets',
    minStockLevel: 10,
    purchasePrice: 0,
    sellingPrice: 0,
    mrp: 0,
    expiryDate: new Date(),
    location: '',
    category: '',
    description: '',
    notes: '',
  });

  useEffect(() => {
    if (id) {
      loadMedicine();
    }
  }, [id]);

  const loadMedicine = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const response = await inventoryService.getById(id);
      const item = response.data;

      setFormData({
        itemName: item.itemName,
        genericName: item.genericName || '',
        manufacturer: item.manufacturer || '',
        batchNumber: item.batchNumber,
        quantity: item.quantity,
        unit: item.unit,
        minStockLevel: item.minStockLevel,
        purchasePrice: item.purchasePrice,
        sellingPrice: item.sellingPrice,
        mrp: item.mrp || 0,
        expiryDate: new Date(item.expiryDate),
        location: item.location || '',
        category: item.category || '',
        description: item.description || '',
        notes: item.notes || '',
      });
    } catch (err) {
      console.error('Load medicine error:', err);
      setError('Failed to load medicine details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : type === 'date' ? new Date(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!id) {
      setError('Medicine ID not found');
      return;
    }

    try {
      setSaving(true);
      await inventoryService.update(id, formData);
      alert('Medicine updated successfully!');
      navigate('/pharmacy');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to update medicine');
      console.error('Update medicine error:', err);
    } finally {
      setSaving(false);
    }
  };

  const units = ['tablets', 'capsules', 'ml', 'mg', 'gm', 'bottles', 'boxes', 'strips', 'vials', 'syringes'];
  const categories = ['tablet', 'capsule', 'syrup', 'injection', 'ointment', 'drops', 'inhaler', 'suspension'];

  const profitMargin = formData.purchasePrice > 0
    ? (((formData.sellingPrice - formData.purchasePrice) / formData.purchasePrice) * 100).toFixed(1)
    : '0';

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <svg style={styles.spinner} width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6">
            <circle cx="12" cy="12" r="10" strokeWidth="3" strokeDasharray="31.4 31.4" strokeLinecap="round">
              <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
            </circle>
          </svg>
          <p style={styles.loadingText}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit}>
        {/* Compact Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Edit Medicine</h1>
          <div style={styles.headerActions}>
            <button type="button" onClick={() => navigate('/pharmacy')} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={saving} style={styles.submitButton}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Compact Table Form */}
        <div style={styles.formCard}>
          <table style={styles.table}>
            <tbody>
              <tr style={styles.row}>
                <td style={styles.labelCell}>Item Name *</td>
                <td style={styles.inputCell}>
                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                </td>
                <td style={styles.labelCell}>Generic Name</td>
                <td style={styles.inputCell}>
                  <input
                    type="text"
                    name="genericName"
                    value={formData.genericName}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </td>
              </tr>

              <tr style={styles.row}>
                <td style={styles.labelCell}>Manufacturer</td>
                <td style={styles.inputCell}>
                  <input
                    type="text"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </td>
                <td style={styles.labelCell}>Category</td>
                <td style={styles.inputCell}>
                  <select name="category" value={formData.category} onChange={handleChange} style={styles.select}>
                    <option value="">Select</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </td>
              </tr>

              <tr style={styles.row}>
                <td style={styles.labelCell}>Batch Number *</td>
                <td style={styles.inputCell}>
                  <input
                    type="text"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                </td>
                <td style={styles.labelCell}>Location</td>
                <td style={styles.inputCell}>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Shelf A-12"
                  />
                </td>
              </tr>

              <tr style={styles.row}>
                <td style={styles.labelCell}>Quantity *</td>
                <td style={styles.inputCell}>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    style={styles.input}
                    required
                    min="0"
                  />
                </td>
                <td style={styles.labelCell}>Unit *</td>
                <td style={styles.inputCell}>
                  <select name="unit" value={formData.unit} onChange={handleChange} style={styles.select} required>
                    {units.map(unit => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </td>
              </tr>

              <tr style={styles.row}>
                <td style={styles.labelCell}>Min Stock Level *</td>
                <td style={styles.inputCell}>
                  <input
                    type="number"
                    name="minStockLevel"
                    value={formData.minStockLevel}
                    onChange={handleChange}
                    style={styles.input}
                    required
                    min="0"
                  />
                </td>
                <td style={styles.labelCell}>MRP (₹)</td>
                <td style={styles.inputCell}>
                  <input
                    type="number"
                    name="mrp"
                    value={formData.mrp}
                    onChange={handleChange}
                    style={styles.input}
                    min="0"
                    step="0.01"
                    placeholder="Maximum Retail Price"
                  />
                </td>
              </tr>

              <tr style={styles.row}>
                <td style={styles.labelCell}>Purchase Price (₹) *</td>
                <td style={styles.inputCell}>
                  <input
                    type="number"
                    name="purchasePrice"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    style={styles.input}
                    required
                    min="0"
                    step="0.01"
                  />
                </td>
                <td style={styles.labelCell}>Selling Price (₹) *</td>
                <td style={styles.inputCell}>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleChange}
                    style={styles.input}
                    required
                    min="0"
                    step="0.01"
                  />
                </td>
              </tr>

              <tr style={styles.row}>
                <td style={styles.labelCell}>Profit Margin</td>
                <td style={styles.inputCell}>
                  <div style={styles.calculatedValue}>
                    ₹{(formData.sellingPrice - formData.purchasePrice).toFixed(2)} ({profitMargin}%)
                  </div>
                </td>
                <td style={styles.labelCell}>Expiry Date *</td>
                <td style={styles.inputCell}>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate instanceof Date ? formData.expiryDate.toISOString().split('T')[0] : ''}
                    onChange={handleChange}
                    style={styles.input}
                    required
                  />
                </td>
              </tr>

              <tr style={styles.row}>
                <td style={styles.labelCell}>Description</td>
                <td style={styles.inputCell}>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Brief description..."
                  />
                </td>
                <td style={styles.labelCell}>Notes</td>
                <td style={styles.inputCell}>
                  <input
                    type="text"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Additional notes..."
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '1rem',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    padding: '1rem 1.5rem',
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
  },
  title: {
    fontSize: '1.5rem',
    margin: 0,
    color: '#1e293b',
    fontWeight: '600' as const,
  },
  headerActions: {
    display: 'flex',
    gap: '0.75rem',
  },
  cancelButton: {
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '500' as const,
  },
  submitButton: {
    padding: '0.5rem 1.25rem',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontWeight: '500' as const,
    boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    border: '1px solid #fecaca',
    fontSize: '0.875rem',
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: '10px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    border: '1px solid #e2e8f0',
    overflow: 'hidden',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
  },
  row: {
    borderBottom: '1px solid #e2e8f0',
  },
  labelCell: {
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500' as const,
    color: '#475569',
    backgroundColor: '#f8fafc',
    width: '15%',
    whiteSpace: 'nowrap' as const,
  },
  inputCell: {
    padding: '0.5rem 1rem',
    width: '35%',
  },
  input: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    outline: 'none',
    backgroundColor: 'white',
    color: '#1e293b',
  },
  select: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    outline: 'none',
    backgroundColor: 'white',
    color: '#1e293b',
    cursor: 'pointer',
  },
  calculatedValue: {
    padding: '0.5rem 0.75rem',
    fontSize: '0.875rem',
    color: '#10b981',
    fontWeight: '600' as const,
    backgroundColor: '#f0fdf4',
    borderRadius: '6px',
    border: '1px solid #d1fae5',
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
};

export default EditMedicine;

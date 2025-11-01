import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { inventoryService } from '../../services';
import type { InventoryFormData } from '../../types';
import { useAuth } from '../../context/AuthContext';

const AddMedicine = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<InventoryFormData>({
    medicineName: '',
    genericName: '',
    manufacturer: '',
    batchNumber: '',
    quantity: 0,
    unit: 'tablets',
    reorderLevel: 10,
    purchasePrice: 0,
    sellingPrice: 0,
    expiryDate: new Date(),
    manufactureDate: new Date(),
    supplier: '',
    location: '',
    category: '',
    description: '',
  });

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

    if (!user?.hospitalId) {
      setError('Hospital ID not found');
      return;
    }

    try {
      setLoading(true);
      await inventoryService.create(user.hospitalId, formData);
      alert('Medicine added successfully!');
      navigate('/pharmacy');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to add medicine');
      console.error('Add medicine error:', err);
    } finally {
      setLoading(false);
    }
  };

  const units = ['tablets', 'capsules', 'ml', 'mg', 'gm', 'bottles', 'boxes', 'strips', 'vials', 'syringes'];
  const categories = ['Antibiotic', 'Analgesic', 'Antipyretic', 'Anti-inflammatory', 'Antacid', 'Antihistamine', 'Antidiabetic', 'Antihypertensive', 'Vitamin', 'Supplement', 'Other'];

  const profitMargin = formData.purchasePrice > 0
    ? (((formData.sellingPrice - formData.purchasePrice) / formData.purchasePrice) * 100).toFixed(1)
    : '0';

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit}>
        {/* Compact Header */}
        <div style={styles.header}>
          <h1 style={styles.title}>Add Medicine</h1>
          <div style={styles.headerActions}>
            <button type="button" onClick={() => navigate('/pharmacy')} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={styles.submitButton}>
              {loading ? 'Adding...' : 'Add Medicine'}
            </button>
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        {/* Compact Table Form */}
        <div style={styles.formCard}>
          <table style={styles.table}>
            <tbody>
              <tr style={styles.row}>
                <td style={styles.labelCell}>Medicine Name *</td>
                <td style={styles.inputCell}>
                  <input
                    type="text"
                    name="medicineName"
                    value={formData.medicineName}
                    onChange={handleChange}
                    style={styles.input}
                    required
                    placeholder="Paracetamol"
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
                    placeholder="Acetaminophen"
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
                    placeholder="Sun Pharma"
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
                    placeholder="BATCH123"
                  />
                </td>
                <td style={styles.labelCell}>Supplier</td>
                <td style={styles.inputCell}>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="ABC Distributors"
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
                <td style={styles.labelCell}>Reorder Level *</td>
                <td style={styles.inputCell}>
                  <input
                    type="number"
                    name="reorderLevel"
                    value={formData.reorderLevel}
                    onChange={handleChange}
                    style={styles.input}
                    required
                    min="0"
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
                <td style={styles.labelCell}>Manufacture Date</td>
                <td style={styles.inputCell}>
                  <input
                    type="date"
                    name="manufactureDate"
                    value={formData.manufactureDate instanceof Date ? formData.manufactureDate.toISOString().split('T')[0] : ''}
                    onChange={handleChange}
                    style={styles.input}
                  />
                </td>
              </tr>

              <tr style={styles.row}>
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
                <td style={styles.labelCell}>Description</td>
                <td style={styles.inputCell}>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
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
};

export default AddMedicine;

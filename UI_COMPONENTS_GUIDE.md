# UI Components Library - Usage Guide

## Overview

A comprehensive UI component library has been created to separate styling from logic and provide reusable components throughout the application.

## Component Directory Structure

```
src/
├── components/
│   └── ui/
│       ├── Button.tsx / Button.module.css
│       ├── Card.tsx / Card.module.css
│       ├── Input.tsx / Input.module.css
│       ├── Loading.tsx / Loading.module.css
│       ├── Alert.tsx / Alert.module.css
│       └── index.ts (exports all components)
└── styles/
    └── (page-specific CSS modules)
```

## Components

### 1. Button Component

**Usage:**
```tsx
import { Button } from '../../components/ui';

// Variants: primary, success, danger, secondary, outline
// Sizes: small, medium, large

<Button variant="primary" size="medium" onClick={handleClick}>
  Click Me
</Button>

<Button variant="success" fullWidth>
  Submit
</Button>

<Button variant="danger" size="small" disabled>
  Delete
</Button>
```

**Props:**
- `variant`: 'primary' | 'success' | 'danger' | 'secondary' | 'outline'
- `size`: 'small' | 'medium' | 'large'
- `fullWidth`: boolean
- All standard button HTML attributes

---

### 2. Card Component

**Usage:**
```tsx
import { Card, CardHeader, CardBody, CardFooter } from '../../components/ui';

<Card variant="elevated">
  <CardHeader title="Patient Information" />
  <CardBody>
    <p>Content goes here...</p>
  </CardBody>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Simple card
<Card>
  <CardBody>
    Simple content
  </CardBody>
</Card>
```

**Props:**
- `variant`: 'default' | 'elevated' | 'flat'
- `noPadding`: boolean

---

### 3. Input Components

**Usage:**
```tsx
import { Input, FormGroup, TextArea, Select } from '../../components/ui';

// Input with FormGroup
<FormGroup
  label="Patient Name"
  htmlFor="name"
  required
  error={errors.name}
  helpText="Enter full name"
>
  <Input
    id="name"
    type="text"
    value={name}
    onChange={handleChange}
    placeholder="John Doe"
    error={!!errors.name}
  />
</FormGroup>

// TextArea
<FormGroup label="Notes">
  <TextArea
    rows={4}
    value={notes}
    onChange={handleChange}
  />
</FormGroup>

// Select with options
<FormGroup label="Gender" required>
  <Select
    options={[
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
      { value: 'other', label: 'Other' },
    ]}
    value={gender}
    onChange={handleChange}
  />
</FormGroup>

// Select with children
<FormGroup label="Status">
  <Select value={status} onChange={handleChange}>
    <option value="">-- Select --</option>
    <option value="active">Active</option>
    <option value="inactive">Inactive</option>
  </Select>
</FormGroup>
```

**Props:**
- `FormGroup`:
  - `label`: string
  - `htmlFor`: string
  - `required`: boolean
  - `error`: string
  - `helpText`: string

- `Input/TextArea/Select`:
  - `error`: boolean
  - All standard HTML input/textarea/select attributes

---

### 4. Loading Component

**Usage:**
```tsx
import { Loading } from '../../components/ui';

// Default
<Loading />

// Custom text and size
<Loading text="Loading patients..." size="large" />

<Loading size="small" text="Please wait..." />
```

**Props:**
- `text`: string (default: 'Loading...')
- `size`: 'small' | 'medium' | 'large'

---

### 5. Alert Component

**Usage:**
```tsx
import { Alert } from '../../components/ui';

// Variants: error, success, warning, info

<Alert variant="error" title="Error">
  Failed to load data
</Alert>

<Alert variant="success" onClose={handleClose}>
  Patient registered successfully!
</Alert>

<Alert variant="warning" title="Warning">
  This action cannot be undone
</Alert>

<Alert variant="info">
  Your session will expire in 5 minutes
</Alert>
```

**Props:**
- `variant`: 'error' | 'success' | 'warning' | 'info'
- `title`: string (optional)
- `onClose`: () => void (optional, shows close button)

---

## Example: Refactored Dashboard

**Before (inline styles):**
```tsx
<div style={{ padding: '2rem', backgroundColor: 'white' }}>
  <button
    onClick={handleClick}
    style={{
      padding: '0.75rem 1.5rem',
      backgroundColor: '#27ae60',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
    }}
  >
    Click Me
  </button>
</div>
```

**After (using components):**
```tsx
import { Card, CardBody, Button } from '../../components/ui';

<Card>
  <CardBody>
    <Button variant="success" onClick={handleClick}>
      Click Me
    </Button>
  </CardBody>
</Card>
```

---

## Converting Existing Pages

### Step 1: Create CSS Module

Create `PageName.module.css` for page-specific styles:

```css
/* Dashboard.module.css */
.container {
  padding: 0;
}

.title {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.statsGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}
```

### Step 2: Import Components and Styles

```tsx
import { Card, CardBody, Button, Loading, Alert } from '../../components/ui';
import styles from './Dashboard.module.css';
```

### Step 3: Replace Inline Styles

```tsx
// Before
<div style={{ padding: '0' }}>
  <h1 style={{ fontSize: '2rem', color: '#2c3e50' }}>Dashboard</h1>
</div>

// After
<div className={styles.container}>
  <h1 className={styles.title}>Dashboard</h1>
</div>
```

### Step 4: Use UI Components

```tsx
// Before
{loading && <div style={{ textAlign: 'center' }}>Loading...</div>}
{error && <div style={{ backgroundColor: '#fee', color: '#c33' }}>{error}</div>}

// After
{loading && <Loading />}
{error && <Alert variant="error">{error}</Alert>}
```

---

## Benefits

### 1. **Separation of Concerns**
- Styling in CSS modules
- Logic in TypeScript
- Reusable components

### 2. **Consistency**
- Uniform look and feel
- Standard colors and spacing
- Predictable behavior

### 3. **Maintainability**
- Easy to update styles globally
- Type-safe props
- Better IDE autocomplete

### 4. **Performance**
- CSS modules are optimized
- Components are memoizable
- Reduced bundle size (shared styles)

### 5. **Developer Experience**
- Less code to write
- Faster development
- Easier to test

---

## Migration Strategy

1. ✅ **Created**: UI component library
2. **Next Steps**:
   - Convert Dashboard page
   - Convert Patient pages
   - Convert Visit pages
   - Convert Prescription pages
   - Convert History page

### Migration Template

```tsx
// 1. Import components
import { Card, CardHeader, CardBody, Button, Loading, Alert } from '../../components/ui';
import styles from './PageName.module.css';

// 2. Replace loading/error states
if (loading) return <Loading text="Loading data..." />;
if (error) return <Alert variant="error">{error}</Alert>;

// 3. Replace cards
<Card>
  <CardHeader title="Section Title" />
  <CardBody>
    Content here
  </CardBody>
</Card>

// 4. Replace buttons
<Button variant="primary" onClick={handleClick}>
  Action
</Button>

// 5. Replace forms
<FormGroup label="Field Name" required error={errors.field}>
  <Input value={value} onChange={handleChange} />
</FormGroup>

// 6. Use CSS modules for layout
<div className={styles.container}>
  <div className={styles.grid}>
    ...
  </div>
</div>
```

---

## Advanced Usage

### Combining Components

```tsx
<Card variant="elevated">
  <CardHeader title="Patient Registration" />
  <CardBody>
    <FormGroup label="Name" required>
      <Input placeholder="Enter name" />
    </FormGroup>
    <FormGroup label="Age">
      <Input type="number" />
    </FormGroup>
  </CardBody>
  <CardFooter>
    <Button variant="primary" fullWidth>
      Register
    </Button>
  </CardFooter>
</Card>
```

### Conditional Rendering

```tsx
{isLoading && <Loading size="small" />}
{isSuccess && <Alert variant="success">Saved successfully!</Alert>}
{isError && <Alert variant="error" title="Error" onClose={clearError}>{errorMessage}</Alert>}
```

---

## TypeScript Support

All components are fully typed with TypeScript:

```tsx
// IntelliSense will show all available props
<Button
  variant={/* 'primary' | 'success' | 'danger' | 'secondary' | 'outline' */}
  size={/* 'small' | 'medium' | 'large' */}
  onClick={(e) => {/* Type-safe event */}}
/>
```

---

## Best Practices

1. **Use CSS Modules for layout** - Keep layout in page CSS modules
2. **Use UI components for interactive elements** - Buttons, inputs, cards
3. **Keep components simple** - One responsibility per component
4. **Compose components** - Build complex UIs from simple components
5. **Consistent naming** - Follow the established naming patterns

---

## Next Steps

1. Create additional utility components as needed:
   - Badge (for status indicators)
   - Modal/Dialog
   - Table (with sorting/pagination)
   - Tabs
   - Tooltip

2. Convert all pages to use the new component library

3. Add Storybook for component documentation (optional)

---

## Questions?

Refer to the component source code in `src/components/ui/` for full implementation details.

# UI Spacing Guide

This guide outlines the proper spacing standards to ensure pages don't overlap with the fixed navbar.

## Navbar Specifications

- **Position**: `fixed top-0`
- **Z-index**: `z-50`
- **Height**: Dynamic (varies based on scroll state)
  - Default: `py-4` (16px top/bottom padding)
  - Scrolled: `py-2` (8px top/bottom padding)

## Page Container Classes

Use these utility classes for consistent page spacing:

### Standard Page Container
```jsx
<div className="page-container">
  <!-- Content -->
</div>
```
- Equivalent to: `pt-24 pb-8`
- Use for: Regular content pages like Project Management, Funding Dashboard

### Large Page Container  
```jsx
<div className="page-container-large">
  <!-- Content -->
</div>
```
- Equivalent to: `pt-32 pb-20`
- Use for: Landing pages, forms, special sections like Login/Signup

### Manual Spacing
If you need custom spacing, use these classes:

- **Standard spacing**: `pt-24` (96px top padding)
- **Large spacing**: `pt-32` (128px top padding)

## Current Implementation Status

✅ **Pages with proper spacing:**

- **Escrow System Pages** (`pt-24`):
  - CreateProject.tsx
  - ProjectManagement.tsx  
  - FundingDashboard.tsx
  - AdminPanel.tsx
  - MilestoneDelivery.tsx
  - TokenFunding.tsx

- **Existing Pages** (Various):
  - Login.tsx (`pt-32`)
  - Signup.tsx (`pt-32`) 
  - Dashboard.tsx (`pt-24`)
  - Projects.tsx (`pt-24`)
  - Freelancers.tsx (`pt-24`)
  - Contests.tsx (`pt-24`)
  - Profile.tsx (`pt-24`)
  - UserProfile.tsx (`pt-32`)
  - Contact.tsx (`pt-32`)
  - HowItWorksPage.tsx (`pt-24`)
  - SavedProfiles.tsx (`pt-32`)
  - PostProject.tsx (`pt-32`)

- **Special Cases**:
  - Index.tsx: Uses Hero component with built-in `pt-32`

## Implementation Guidelines

### For New Pages
1. Use `page-container` class for standard pages
2. Use `page-container-large` class for special/form pages
3. Add `page-header` class to header sections

### For Existing Pages
- All pages have been updated with proper spacing
- No further action needed unless adding new pages

### Common Patterns

#### Standard Page Layout
```jsx
const MyPage = () => {
  return (
    <div className="page-container max-w-6xl mx-auto px-4">
      <div className="page-header">
        <h1 className="text-3xl font-bold mb-2">Page Title</h1>
        <p className="text-muted-foreground">Page description</p>
      </div>
      {/* Page content */}
    </div>
  );
};
```

#### Form Page Layout
```jsx
const MyFormPage = () => {
  return (
    <div className="page-container-large">
      <div className="container mx-auto px-4 max-w-md">
        {/* Form content */}
      </div>
    </div>
  );
};
```

## Responsive Considerations

- The spacing works across all screen sizes
- Mobile navigation drawer doesn't affect these spacing calculations
- Tablets and desktops use the same spacing standards

## Testing

To verify proper spacing:
1. Navigate to any page
2. Check that content doesn't overlap with the navbar
3. Scroll up/down to ensure proper clearance
4. Test on mobile, tablet, and desktop viewports

---

This spacing system ensures a consistent user experience across all pages while preventing navbar overlap issues.

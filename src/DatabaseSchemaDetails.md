# Database Schema Documentation

## 1. Tables and Their Purpose

### Core Tables
- **inventory_items**: Main table for stock management
- **inventory_movements**: Tracks stock movements (in/out)
- **orders**: Stores order information
- **customers**: Customer management
- **suppliers**: Supplier management
- **warehouses**: Warehouse locations and details

### Supporting Tables
- **categories**: Product categorization
- **inventory_groups**: Grouping of inventory items
- **document_templates**: Templates for orders and reports
- **batch_operations**: Bulk operations tracking
- **inventory_analytics**: Stock level analytics
- **profiles**: User profiles
- **user_roles**: Role-based access control
- **user_settings**: User preferences

## 1.2 Fields in Each Table

### inventory_items
- id (UUID): Primary key
- name (text): Item name
- sku (text): Stock keeping unit
- category (enum): Product category (homme/femme/enfant/bebe)
- size (text): Size information
- quantity_per_box (integer): Units per box
- total_quantity (integer): Total available stock
- price (numeric): Item price
- status (enum): Stock status
- warehouse_id (UUID): Associated warehouse
- low_stock_threshold (integer): Reorder point
- last_counted_at (timestamp): Last inventory count
- last_ordered_at (timestamp): Last order date

### orders
- id (UUID): Primary key
- order_number (text): Unique order reference
- customer_id (UUID): Customer reference
- status (enum): Order status
- total_amount (numeric): Order total
- pdf_url (text): Generated PDF location
- created_at (timestamp): Creation date
- updated_at (timestamp): Last update

## 1.3 Relationships Between Tables

### Direct Relationships
- inventory_items → warehouses (Many-to-One)
- inventory_items → inventory_groups (Many-to-One)
- order_items → orders (Many-to-One)
- order_items → inventory_items (Many-to-One)
- orders → customers (Many-to-One)
- orders → suppliers (Many-to-One)

### Indirect Relationships
- inventory_movements tracks changes to inventory_items
- inventory_analytics provides insights on inventory_items

## 1.4 Indexes and Performance Optimization

### Existing Indexes
- Primary keys (UUID) on all tables
- Foreign key indexes for relationships
- SKU index on inventory_items
- Order number index on orders

### Performance Considerations
- Partitioning strategy for large tables (inventory_movements)
- Regular vacuum and analyze operations
- Materialized views for analytics

## 1.5 User Roles and Permissions

### Role Types
- admin: Full system access
- manager: Limited administrative access
- user: Basic operations

### Table-Level Permissions
- RLS policies implement role-based access
- All tables require authentication
- Audit trails track user actions

## 1.6 Audit and Logging

### Change Tracking
- updated_at columns on all major tables
- inventory_movements table tracks stock changes
- batch_operations table logs bulk operations

### 1.6.1 Change Tracking Implementation
- Triggers update the updated_at timestamp
- Movement logs include user_id and timestamp
- PDF generation logs stored with orders

## 1.7 Data Validation and Constraints

### Business Rules
- Positive quantities for inventory
- Valid status transitions for orders
- Required customer details for orders
- SKU uniqueness

### Technical Constraints
- Foreign key constraints
- Not null constraints on critical fields
- Check constraints on numerical values
- Enum types for status fields

## 1.8 Scalability Considerations

### Current Implementation
- UUID for primary keys
- Separate analytics table
- Efficient indexing strategy

### Future Considerations
- Table partitioning for historical data
- Archive strategy for old records
- Read replicas for reporting

## 1.9 Export and Reporting

### Available Exports
- Order PDFs with complete details
- Inventory reports
- Analytics dashboards
- Customer statements

### Data Format
- PDF for official documents
- CSV for data analysis
- JSON for API responses

## 1.10 Security

### Data Protection
- Row Level Security (RLS)
- Encrypted connections
- Password hashing
- Session management

### Access Control
- Role-based permissions
- API key management
- Audit logging

## 2. Additional Requirements

### Export Functionality
PDF exports include:
- Order details
- Customer information
- Product list with quantities
- Pricing and totals
- Terms and conditions
- Company branding

### UI/UX Preferences
- Responsive design
- Dark/light mode support
- Customizable dashboard
- Quick search functionality
- Bulk operations support
- Real-time updates
- Toast notifications
- Form validation
- Error handling
- Loading states
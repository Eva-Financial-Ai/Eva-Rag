// Asset Class Definitions for Portfolio Management

export enum AssetClass {
  // Real Estate (4 types)
  COMMERCIAL_REAL_ESTATE = 'commercial_real_estate',
  RESIDENTIAL_REAL_ESTATE = 'residential_real_estate',
  INDUSTRIAL_REAL_ESTATE = 'industrial_real_estate',
  RETAIL_REAL_ESTATE = 'retail_real_estate',

  // Equipment & Machinery (3 types)
  CONSTRUCTION_EQUIPMENT = 'construction_equipment',
  MANUFACTURING_EQUIPMENT = 'manufacturing_equipment',
  MEDICAL_EQUIPMENT = 'medical_equipment',

  // Vehicles (3 types)
  COMMERCIAL_VEHICLES = 'commercial_vehicles',
  FLEET_VEHICLES = 'fleet_vehicles',
  SPECIALTY_VEHICLES = 'specialty_vehicles',

  // Business Assets (4 types)
  INVENTORY = 'inventory',
  ACCOUNTS_RECEIVABLE = 'accounts_receivable',
  INTELLECTUAL_PROPERTY = 'intellectual_property',
  BUSINESS_EQUITY = 'business_equity',

  // Financial Instruments (4 types)
  SECURITIES = 'securities',
  COMMODITIES = 'commodities',
  CRYPTOCURRENCY = 'cryptocurrency',
  STRUCTURED_PRODUCTS = 'structured_products',
}

// Base asset interface
export interface BaseAsset {
  id: string;
  assetClass: AssetClass;
  name: string;
  description?: string;
  acquisitionDate: Date;
  acquisitionCost: number;
  currentValue: number;
  lastValuationDate: Date;
  status: AssetStatus;
  documents?: AssetDocument[];
}

export enum AssetStatus {
  ACTIVE = 'active',
  UNDER_REVIEW = 'under_review',
  IMPAIRED = 'impaired',
  DISPOSED = 'disposed',
  HELD_FOR_SALE = 'held_for_sale',
}

export interface AssetDocument {
  id: string;
  type: string;
  name: string;
  url: string;
  uploadDate: Date;
}

// Real Estate specific interfaces
export interface RealEstateAsset extends BaseAsset {
  propertyType: string;
  address: Address;
  squareFootage: number;
  yearBuilt: number;
  zoning: string;
  occupancyRate?: number;
  numberOfUnits?: number;
  parkingSpaces?: number;
  environmentalAssessment?: EnvironmentalAssessment;
  tenants?: Tenant[];
  operatingExpenses: OperatingExpenses;
  propertyTaxes: number;
  insurance: Insurance;
  mortgageDetails?: MortgageDetails;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface EnvironmentalAssessment {
  phase1Date?: Date;
  phase2Date?: Date;
  issues?: string[];
  remediation?: string;
}

export interface Tenant {
  id: string;
  name: string;
  leaseStartDate: Date;
  leaseEndDate: Date;
  monthlyRent: number;
  securityDeposit: number;
  unit?: string;
}

export interface OperatingExpenses {
  utilities: number;
  maintenance: number;
  management: number;
  other: number;
  total: number;
}

export interface Insurance {
  provider: string;
  policyNumber: string;
  coverage: number;
  premium: number;
  expirationDate: Date;
}

export interface MortgageDetails {
  lender: string;
  originalAmount: number;
  currentBalance: number;
  interestRate: number;
  maturityDate: Date;
  monthlyPayment: number;
}

// Equipment specific interfaces
export interface EquipmentAsset extends BaseAsset {
  manufacturer: string;
  model: string;
  serialNumber: string;
  yearManufactured: number;
  condition: EquipmentCondition;
  maintenanceHistory: MaintenanceRecord[];
  warranty?: Warranty;
  operatingHours?: number;
  location: string;
  operator?: string;
  specifications: Record<string, any>;
}

export enum EquipmentCondition {
  NEW = 'new',
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
  FOR_PARTS = 'for_parts',
}

export interface MaintenanceRecord {
  date: Date;
  type: 'routine' | 'repair' | 'inspection';
  description: string;
  cost: number;
  performedBy: string;
  nextServiceDue?: Date;
}

export interface Warranty {
  provider: string;
  startDate: Date;
  endDate: Date;
  coverage: string;
  transferable: boolean;
}

// Vehicle specific interfaces
export interface VehicleAsset extends BaseAsset {
  make: string;
  model: string;
  year: number;
  vin: string;
  licensePlate: string;
  mileage: number;
  fuelType: FuelType;
  transmission: TransmissionType;
  color: string;
  vehicleType: string;
  maintenanceHistory: MaintenanceRecord[];
  insurance: VehicleInsurance;
  registration: VehicleRegistration;
  accidents?: AccidentRecord[];
}

export enum FuelType {
  GASOLINE = 'gasoline',
  DIESEL = 'diesel',
  ELECTRIC = 'electric',
  HYBRID = 'hybrid',
  NATURAL_GAS = 'natural_gas',
  HYDROGEN = 'hydrogen',
}

export enum TransmissionType {
  MANUAL = 'manual',
  AUTOMATIC = 'automatic',
  CVT = 'cvt',
  DUAL_CLUTCH = 'dual_clutch',
}

export interface VehicleInsurance extends Insurance {
  deductible: number;
  comprehensiveCoverage: boolean;
  collisionCoverage: boolean;
}

export interface VehicleRegistration {
  registrationNumber: string;
  expirationDate: Date;
  state: string;
  fees: number;
}

export interface AccidentRecord {
  date: Date;
  description: string;
  repairCost: number;
  insuranceClaim?: string;
  policeReport?: string;
}

// Business Asset specific interfaces
export interface InventoryAsset extends BaseAsset {
  category: string;
  sku: string;
  quantity: number;
  unitCost: number;
  location: string;
  turnoverRate: number;
  ageInDays: number;
  supplier: Supplier;
  reorderPoint: number;
  reorderQuantity: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactInfo: ContactInfo;
  terms: string;
  leadTime: number;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: Address;
}

export interface AccountsReceivableAsset extends BaseAsset {
  debtor: Debtor;
  invoiceNumber: string;
  invoiceDate: Date;
  dueDate: Date;
  originalAmount: number;
  outstandingAmount: number;
  daysPastDue: number;
  collectionStatus: CollectionStatus;
  paymentHistory: PaymentRecord[];
}

export interface Debtor {
  id: string;
  name: string;
  creditRating?: string;
  contactInfo: ContactInfo;
  paymentTerms: string;
}

export enum CollectionStatus {
  CURRENT = 'current',
  PAST_DUE = 'past_due',
  IN_COLLECTION = 'in_collection',
  WRITTEN_OFF = 'written_off',
  PAID = 'paid',
}

export interface PaymentRecord {
  date: Date;
  amount: number;
  method: string;
  reference: string;
}

export interface IntellectualPropertyAsset extends BaseAsset {
  ipType: IPType;
  registrationNumber?: string;
  registrationDate?: Date;
  expirationDate?: Date;
  jurisdiction: string[];
  creator?: string;
  licensees?: Licensee[];
  royaltyRate?: number;
  annualRevenue?: number;
}

export enum IPType {
  PATENT = 'patent',
  TRADEMARK = 'trademark',
  COPYRIGHT = 'copyright',
  TRADE_SECRET = 'trade_secret',
  DESIGN = 'design',
}

export interface Licensee {
  id: string;
  name: string;
  agreementDate: Date;
  expirationDate: Date;
  royaltyRate: number;
  minimumGuarantee?: number;
}

export interface BusinessEquityAsset extends BaseAsset {
  companyName: string;
  ownershipPercentage: number;
  shareClass: string;
  numberOfShares: number;
  votingRights: boolean;
  boardRepresentation: boolean;
  financials: CompanyFinancials;
  valuation: BusinessValuation;
}

export interface CompanyFinancials {
  revenue: number;
  ebitda: number;
  netIncome: number;
  totalAssets: number;
  totalLiabilities: number;
  asOfDate: Date;
}

export interface BusinessValuation {
  method: ValuationMethod;
  multiple?: number;
  discountRate?: number;
  comparableCompanies?: string[];
  valuationDate: Date;
  performedBy: string;
}

export enum ValuationMethod {
  DCF = 'dcf',
  COMPARABLE_COMPANY = 'comparable_company',
  PRECEDENT_TRANSACTION = 'precedent_transaction',
  ASSET_BASED = 'asset_based',
  REVENUE_MULTIPLE = 'revenue_multiple',
}

// Financial Instrument specific interfaces
export interface SecuritiesAsset extends BaseAsset {
  ticker?: string;
  cusip?: string;
  securityType: SecurityType;
  quantity: number;
  purchasePrice: number;
  marketPrice: number;
  exchange?: string;
  maturityDate?: Date;
  couponRate?: number;
  rating?: string;
}

export enum SecurityType {
  STOCK = 'stock',
  BOND = 'bond',
  MUTUAL_FUND = 'mutual_fund',
  ETF = 'etf',
  OPTION = 'option',
  WARRANT = 'warrant',
}

export interface CommoditiesAsset extends BaseAsset {
  commodityType: CommodityType;
  quantity: number;
  unit: string;
  grade?: string;
  storageLocation?: string;
  storageCost: number;
  futuresContracts?: FuturesContract[];
}

export enum CommodityType {
  GOLD = 'gold',
  SILVER = 'silver',
  OIL = 'oil',
  NATURAL_GAS = 'natural_gas',
  WHEAT = 'wheat',
  CORN = 'corn',
  COPPER = 'copper',
  OTHER = 'other',
}

export interface FuturesContract {
  contractId: string;
  expirationDate: Date;
  strikePrice: number;
  quantity: number;
  exchange: string;
}

export interface CryptocurrencyAsset extends BaseAsset {
  symbol: string;
  blockchain: string;
  walletAddress: string;
  quantity: number;
  purchasePrice: number;
  marketPrice: number;
  exchange?: string;
  stakingRewards?: number;
  locked?: boolean;
  unlockDate?: Date;
}

export interface StructuredProductAsset extends BaseAsset {
  productType: string;
  issuer: string;
  underlyingAssets: string[];
  maturityDate: Date;
  couponRate?: number;
  barrierLevel?: number;
  participationRate?: number;
  capitalProtection: boolean;
  currentNAV: number;
}

// Type guards
export const isRealEstateAsset = (asset: BaseAsset): asset is RealEstateAsset => {
  return [
    AssetClass.COMMERCIAL_REAL_ESTATE,
    AssetClass.RESIDENTIAL_REAL_ESTATE,
    AssetClass.INDUSTRIAL_REAL_ESTATE,
    AssetClass.RETAIL_REAL_ESTATE,
  ].includes(asset.assetClass);
};

export const isEquipmentAsset = (asset: BaseAsset): asset is EquipmentAsset => {
  return [
    AssetClass.CONSTRUCTION_EQUIPMENT,
    AssetClass.MANUFACTURING_EQUIPMENT,
    AssetClass.MEDICAL_EQUIPMENT,
  ].includes(asset.assetClass);
};

export const isVehicleAsset = (asset: BaseAsset): asset is VehicleAsset => {
  return [
    AssetClass.COMMERCIAL_VEHICLES,
    AssetClass.FLEET_VEHICLES,
    AssetClass.SPECIALTY_VEHICLES,
  ].includes(asset.assetClass);
};

/** @format */

export interface ExtendedData {
	petFee?: number
	petsAllowed?: boolean
	petsMax?: number
	breakfastFee?: number
	breakfastAllowed?: boolean
	babyCribFee?: number
	babyCribAllowed?: boolean
}

export interface PlaceType extends Place {
	id: number
}

export interface PropertyCardType extends Property {
	id: number
}
// API base URL - relative for client-side to avoid CORS issues
export const NEXT_PUBLIC_API_BASE_URL = "/api"

export interface OfferProperty {
	property: {
		id: number
		name: string
		location: string
		place: {
			name: string
		}
		maxOccupancy: number
		minOccupancy: number
		images: Array<{
			path: string
			filename: string
		}>
		filters: string[]
		size: number
		numSingleBeds: number
		numDoubleBeds: number
	}
	price: number
	originalPrice: number
	discountPercentage: number
	guests: number
}

export interface PublicOfferProperty {
	property: {
		id: number
		name: string
		location: string
		place: {
			name: string
		}
		maxOccupancy: number
		minOccupancy: number
		images: Array<{
			path: string
			filename: string
		}>
		filters: string[]
		size: number
		numSingleBeds: number
		numDoubleBeds: number
	}
	price: number
	originalPrice: number
	discountPercentage: number
	guests: number
}

export interface OfferData {
	offerId: string
	startDate: string
	endDate: string
	guests: number
	currency: string
	expiresAt: string
	offerProperties: OfferProperty[]
	totalValue: number
}

export interface PublicOfferData {
	offerId: string
	startDate: string
	endDate: string
	guests: number
	currency: string
	expiresAt: string
	offerProperties: PublicOfferProperty[]
	totalValue: number
}

export enum PropertyFilterType {
	SAUNA = "SAUNA",
	SWIMMING_POOL = "SWIMMING_POOL",
	BALCONY = "BALCONY",
	WIFI = "WIFI",
	AIR_CONDITIONING = "AIR_CONDITIONING",
	PET_FRIENDLY = "PET_FRIENDLY",
	KITCHEN = "KITCHEN",
	WASHING_MACHINE = "WASHING_MACHINE",
	PARKING = "PARKING",
	TV = "TV",
	DISHWASHER = "DISHWASHER",
	HEATING = "HEATING",
	ELEVATOR = "ELEVATOR",
	SEA_VIEW = "SEA_VIEW",
	MOUNTAIN_VIEW = "MOUNTAIN_VIEW",
	GARDEN = "GARDEN",
	BBQ = "BBQ",
	TERRACE = "TERRACE",
	WHEELCHAIR_ACCESSIBLE = "WHEELCHAIR_ACCESSIBLE",
	JACUZZI = "JACUZZI",
	BATHROOM_WITH_BATHTUB = "BATHROOM_WITH_BATHTUB",
	COFFEE_TEA_SET = "COFFEE_TEA_SET",
	LOUNGE_AREA = "LOUNGE_AREA",
	VACUUM_CLEANER = "VACUUM_CLEANER",
	IRON_IRONING_BOARD = "IRON_IRONING_BOARD",
	ELECTRIC_KETTLE = "ELECTRIC_KETTLE",
	REFRIGERATOR = "REFRIGERATOR",
	MICROWAVE = "MICROWAVE",
	KITCHEN_UTENSILS = "KITCHEN_UTENSILS",
	TOWELS = "TOWELS",
	HAIR_DRYER = "HAIR_DRYER",
	WARDROBE = "WARDROBE",
	COFFEE_MACHINE = "COFFEE_MACHINE",
	TOILET = "TOILET",
	UPSTAIRS_BEDROOM = "UPSTAIRS_BEDROOM",
	FITNESS_ROOM = "FITNESS_ROOM",
	PLAYGROUND = "PLAYGROUND",
	PLAYROOM = "PLAYROOM",
	KITCHENETTE = "KITCHENETTE",
	COOKTOP = "COOKTOP",
	OVEN = "OVEN",
	BATHROOM_WITH_SHOWER = "BATHROOM_WITH_SHOWER",
	SAFE = "SAFE",
	PRIVATE_GARAGE = "PRIVATE_GARAGE",
	MEZZANINE = "MEZZANINE",
	BUNK_BED = "BUNK_BED",
	TOASTER = "TOASTER",
	ELECTRIC_FIREPLACE = "ELECTRIC_FIREPLACE",
	CABLE_CHANNELS = "CABLE_CHANNELS",
	FREEZER = "FREEZER",
	FIREPLACE = "FIREPLACE",
	DESK = "DESK",
	PLAYSTATION = "PLAYSTATION",
	GROUND_FLOOR = "GROUND_FLOOR",
}

export type NobedsReservationType = {
	order_id?: number
	hotel_id: number
	room_id: number
	vroom_id: number | null
	user_id: number | null
	invoice: number | null
	referral: string | null
	referral_order_id: string | null
	checkin: string // date-time
	checkout: string // date-time
	name: string | null
	country: string | null
	address: string | null
	email: string | null
	emailas: string | null
	phone: string | null
	guests: number | null
	childrens: number | null
	infants: number | null
	nights: number | null
	price: number | null
	total: number | null
	services: number | null
	taxes: number | null
	prepay: number | null
	comission: number | null
	balance: number | null
	status: string | null
	comment: string | null
	created: string | null // date-time
	inserted: string | null // date-time
	updated: string | null // date-time
	canceled: string | null // date-time
	deleted: string | null // date-time
	roomreservation_id: string | null
	ruid: string | null
	genius: string | null
	review: number | null
	staff: string | null
	staff_review: number | null
	cleaned: string | null
	cleanness: number | null
	blob: string | null
	pid: string | null
	b_name: string | null
	b_price: string | null
	b_extras: string | null
	b_smoking: string | null
	b_remarks: string | null
	b_info: string | null
	b_meal: string | null
	photo_url: string | null
	company_name: string | null
	company_address: string | null
	company_code: string | null
	coupon: string | null
	hour: number | null
	document_url: string | null
	signature_url: string | null
	signature_info: string | null
	safebox_sms: string | null // date-time
	safebox_email: string | null // date-time
	approved_timestamp: string | null // date-time
	paid_timestamp: string | null // date-time
	proforma_timestamp: string | null // date-time
	invoice_timestamp: string | null // date-time
}

export type AvailabilityGetRequestType = {
	room_id: number
	fromdate: string
	todate: string
}

export type NobedsSearchRequestType = {
	fromdate: string
	todate: string
	guests: number
	id: string
	roomId?: number
}

export type PrismaUserRoomIdhRequestType = {
	userId: string
	roomId?: number
	room_id: number
	toDate: Date
}

export type NobedsRequestDeleteType = {
	room_id: number | null | undefined
	event: Event
	availability: Availability | undefined
	price: number
}

export interface EventType {
	id: number | undefined
	room_id?: number | null
	order_id: number | null
	name: string | null
	attributes?: { date: Date | undefined }
	apartment?: string
	surname: string | null
	phone: string | null
	email: string | null
	startDate: Date
	endDate: Date
	price: number | null
	ownerPrice: number | null
	deposit: string | null
	document?: string | null
	documentDone?: boolean
	paid: boolean
	cityTax: number
	amountOfPeople: number
	reason: string
	status: string
	numOfParkingPlaces: number
	property: {
		id: number
		room_id?: number | null
		location: string
		name: string
		type: string
		minOccupancy: number
		maxOccupancy: number
		placeId: number
		state: string
		userId: string
	}
	place: { id: number; location: string; name: string; userId: string }
	propertyId: number | null
	placeId: number | null
	userId: string
	notes: string | null
	source: string
	sourceDescription: string | null
	createdAt: Date
	updated: string | Date | null
	parsedRemarks?: unknown
}

export type AvailabilityData = {
	room_id: number
	fromdate: string
	todate: string
}

export const dataDummy = {
	room_id: 2469605,
	fromdate: "2024-04-01T00:00:00",
	todate: "2024-04-30T00:00:00",
}

// Define the type for your data objects
export interface DataObject {
	rid: number | null
	user_id: number | null
	hotel_id: number
	room_id: number
	date: string
	price: number
	quantity: number
	comment: string | null
	created: string | null
	updated: string | null
	last_minute: string | null
	min_stay: string | null
	max_stay: string | null
	closed: string | null
	coa: string | null
	cod: string | null
	mah: string | null
	one: string | null
	two: string | null
	three: string | null
	four: string | null
	five: string | null
	six: string | null
	seven: string | null
	eight: string | null
	nine: string | null
	ten: string | null
	airbnb: string | null
	booking: string | null
	expedia: string | null
	hostelworld: string | null
	agoda: string | null
}

export interface DataObjectCreateMapping {
	rid: number // 0 to create new
	room_id: number
	date: string
	price: number
	quantity: number
	min_stay: number
	max_stay: number
}

export type SetPriceAvailability = {
	ridObjArr: DataObject[]
	room_id: number
}

export type CreatePriceAvailability = {
	ridObjArr: DataObjectCreateMapping[]
	room_id: number
	datefrom: string
	dateto: string
	availability: Availability
}

export type DeletePriceAvailability = {
	ridObjArr: DataObjectCreateMapping[]
	room_id: number
	datefrom: string
	dateto: string
	availability: Availability
}

export type Account = {
	id: string
	userId: string
	type: string
	provider: string
	providerAccountId: string
	refresh_token?: string
	access_token?: string
	expires_at?: number
	token_type?: string
	scope?: string
	id_token?: string
	session_state?: string
	user: User
}

export type User = {
	id: string
	name?: string
	email?: string
	emailVerified?: Date
	image?: string
	role: Role
	modules: string[]
	accounts: Account[]
	Availability: Availability[]
	event: Event[]
	Permission: Permission[]
	place: Place[]
	property: Property[]
	issuedReconciliations: Reconciliation[]
	receivedReconciliations: Reconciliation[]
	ttLockCredentials?: TTLockCredentials
}

export type Place = {
	id: number | null
	name: string
	location: string
	description?: string | null
	userId: string
	event?: Event[] | null
	Permission?: Permission[] | null
	user?: User | null
	properties?: Property[] | null
	images?: ImageType[] | null
}

export type ImageType = {
	id: number
	propertyId?: number | null
	placeId?: number | null
	path: string
	filename: string
	order?: number
}

export enum Brand {
	MSC = "MSC",
	MOUNTAIN = "MOUNTAIN",
}

export type Property = {
	id: number
	name: string
	type: string
	minOccupancy: number
	maxOccupancy: number
	numSingleBeds: number
	numDoubleBeds: number
	state: string
	location: string
	userId: string
	placeId: number
	cleaningFee: number
	cleaningFeeDays: number
	commission: number
	room_id?: number | null
	ttlockId?: number | null
	parkingFee: number
	parkingQuantity: number
	roomQuantity?: number
	localTax: number
	lang: "en" | "de" | "fr" | "it" | "es"
	availabilities?: Availability[]
	event?: Event[]
	Permission?: Permission[]
	place?: Place
	user?: User
	images?: ImageType[]
	emailNotification: string[]
	cityId?: number
	city?: City
	cleaningFeeDeducted: boolean
	checkinInstructionTime?: string | null
	checkoutInstructionTime?: string | null
	sendCheckinInstructions: boolean
	sendCheckoutInstructions: boolean
	telegramChatIds: string[]
	sendTelegram: boolean
	lastMinuteOfferActive?: boolean
	lastMinuteDiscountPercentage?: number
	lastMinuteDaysAhead?: number
	paymentsOn: boolean
	filters: string[] // New field for filter tags
	brand: Brand // New brand field
	size?: number // Property size in m²
	htmlDetails?: string // HTML formatted details/description for the property
	roomId?: number | null // Optional room ID for properties that have a specific room associated
	personBasedPricings?: Array<{
		id: number
		propertyId: number
		basePersonCount: number
		adjustments: JSON // JsonValue from Prisma
		createdAt: Date
		updatedAt: Date
	}> // Person-based pricing configurations
	extended?: JSON | null // Extended JSON data for additional fields like minPrice, maxPrice
	slugs?: Record<string, string> | null // Language-specific URL slugs for the property
}

export type Country = {
	id: number
	name: string
	code: string
	cities?: City[] // Relation to cities
}

export type City = {
	id: number
	name: string
	countryId: number
	country?: Country
}

export type DayPrice = {
	day: number
	price: number
}

export type WeekPrices = {
	id: number | null
	mondayPrice: number
	tuesdayPrice: number
	wednesdayPrice: number
	thursdayPrice: number
	fridayPrice: number
	saturdayPrice: number
	sundayPrice: number
	availabilityId: number | null
}

export type Availability = {
	id: number | null
	isOpen: boolean
	price: number
	minStay: number
	maxStay: number
	quantity: number
	discountPercentage: number | null
	discountDaysBeforeArrival: number | null
	propertyId: number
	roomId: number
	room_id: number
	startDate: string
	endDate: string
	userId: string
	weekPrices: WeekPrices | null
	property?: Property | null
}

// export type Event = {
// 	id: number | undefined
// 	name?: string | null
// 	surname?: string | null
// 	phone?: string | null
// 	email?: string | null
// 	startDate: Date
// 	endDate: Date
// 	price?: number | null
// 	deposit: string
// 	depositReturned: boolean | null
// 	paid: boolean
// 	instructionsSent?: boolean | null
// 	cityTax: number
// 	amountOfPeople: number
// 	reason: string
// 	status: string
// 	numOfParkingPlaces: number
// 	notes?: string | null
// 	source: string
// 	sourceDescription?: string | null
// 	placeId?: number
// 	propertyId?: number
// 	userId?: string
// 	createdAt?: Date
// 	updated: string | Date | null
// 	document: string
// 	documentDone: boolean
// 	room_id?: number | null
// 	ttlockPwd?: string | null
// 	ttlockPwdId?: string | null
// 	order_id?: number | null
// 	extraFees?: number | null
// 	paymentId?: string | null
// 	attributes?: { date: Date | undefined; uid: string | undefined }
// 	apartment?: string
// 	Permission?: Permission[] | null
// 	date?: string | null | undefined
// 	type?: string | null | undefined
// 	place?: Place | null
// 	property?: Property | null
// 	user?: User | null
// 	accessToken?: string | null
// 	accessTokenExpiry?: Date | null
// }

export interface NewsletterData {
	accepted: boolean
	email?: string
	date?: string
	bonus?: string
}

export interface EventExtendedData {
	newsletter?: NewsletterData
	[key: string]: unknown // Allow other properties
}

export type EventExtendedField = EventExtendedData | Record<string, unknown> | null | undefined

export type Event = {
	id: number | undefined
	name?: string | null
	surname?: string | null
	phone?: string | null
	email?: string | null
	startDate: Date
	endDate: Date
	price?: number | null
	ownerPrice?: number | null
	deposit: string
	depositReturned: boolean | null
	paid: boolean
	instructionsSent?: boolean | null
	cityTax: number
	amountOfPeople: number
	reason: string
	status: string
	numOfParkingPlaces: number
	notes?: string | null
	source: string
	sourceDescription?: string | null
	placeId?: number
	propertyId?: number
	userId?: string
	createdAt?: Date
	updated: string | Date | null
	document: string
	documentDone: boolean
	room_id?: number | null
	ttlockPwd?: string | null
	ttlockPwdId?: string | null
	order_id?: number | null
	extraFees?: number | null
	paymentId?: string | null
	attributes?: { date: Date | undefined; uid: string | undefined }
	apartment?: string
	Permission?: Permission[] | null
	date?: string | null | undefined
	type?: string | null | undefined
	place?: Place | null
	property?: Property | null
	user?: User | null
	accessToken?: string | null
	accessTokenExpiry?: Date | null
	extended?: EventExtendedField // Extended JSON data for additional fields like newsletter
	parsedRemarks?: unknown
}

export type EventDeleted = {
	id: number | undefined
	deleted_id: number | undefined
	name?: string | null
	surname?: string | null
	phone?: string | null
	email?: string | null
	startDate: Date
	endDate: Date
	price?: number | null
	deposit: string
	depositReturned: boolean | null
	paid: boolean
	cityTax: number
	amountOfPeople: number
	reason: string
	status: string
	numOfParkingPlaces: number
	notes?: string | null
	source: string
	sourceDescription?: string | null
	placeId: number
	propertyId: number
	userId: string
	createdAt: Date
	updated: string | Date | null
	document: string
	documentDone: boolean
	room_id?: number | null
	ttlockPwd?: string | null
	ttlockPwdId?: string | null
	order_id?: number | null
	extraFees?: number | null
	attributes?: { date: Date | undefined; uid: string | undefined }
	apartment?: string
	paymentId?: string | null
	accessToken?: string | null
	accessTokenExpiry?: Date | null
}

export type EventReq = {
	id: number | undefined
	name?: string
	surname?: string
	phone?: string
	email?: string
	startDate: Date
	endDate: Date
	price?: number
	deposit: string
	depositReturned: boolean | null
	paid: boolean
	cityTax: number
	amountOfPeople: number
	reason: string
	status: string
	numOfParkingPlaces: number
	notes?: string
	source: string
	sourceDescription?: string
	placeId: number
	propertyId: number
	userId: string
	createdAt: Date
	document: string
	documentDone: boolean
	room_id?: number | null | undefined
	order_id?: number
	extraFees?: number
	attributes?: { date: Date | undefined; uid: string | undefined }
	apartment?: string
}

export type Permission = {
	id: number
	userId: string
	propertyId: number
	placeId: number
	type: PermissionType
	owner?: string
	ownerEmail?: string
	userEmail?: string
	place: Place
	property: Property
	user: User
	event: Event[]
}

export type Reconciliation = {
	id: number
	issuerId: string
	receiverId: string
	status: ReconciliationStatus
	amount: number
	issuedAt: Date
	resolvedAt?: Date
	month: string
	year: string
	issuer: User
	receiver: User
	link?: string
}

export type VerificationToken = {
	identifier: string
	token: string
	expires: Date
}

export type TTLockCredentials = {
	id: string
	userId: string
	username: string
	password: string
	md5Hash: string
	user: User
}

export enum PermissionType {
	CALENDAR = "CALENDAR",
	CLEANER = "CLEANER",
	MANAGER = "MANAGER",
	ADMIN = "ADMIN",
}

export enum ReconciliationStatus {
	PENDING = "PENDING",
	ACCEPTED = "ACCEPTED",
	REJECTED = "REJECTED",
	REOPENED = "REOPENED",
	CLOSED = "CLOSED",
	PAID = "PAID",
	INVOICED = "INVOICED",
}

export enum Role {
	ADMIN = "ADMIN",
	USER = "USER",
	GUEST = "GUEST",
	PREMIUM = "PREMIUM",
}

export type TaskName =
	| "user"
	| "userProperties"
	| "userPlaces"
	| "availability"
	| "events"
	| "users"
	| "permissions"
	| "permissionsOwner"
	| "permissionsAll"
	| "reconcile"
	| "eventsDeleted"
	| "eventsDeletedAll"
	| "templates"
	| "templatesAll"
	| "teacher"
	| "teachers"
	| "teacherAvailability"
	| "lessons"
	| "countries"
	| "cities"
	| "restaurants"

export type UserData = {
	user?: User
	users?: User[]
	userProperties?: Property[]
	userPlaces?: Place[]
	availability?: Availability[]
	events?: Event[]
	eventsDeleted?: EventDeleted[]
	permissions?: Permission[]
	permissionsOwner?: Permission[]
	permissionsAll?: Permission[]
	reconcileIssuer?: Reconciliation[]
	reconcileReceiver?: Reconciliation[]
	templates?: EmailTemplate[]
	templatesAll?: EmailTemplate[]
	cities: City[]
	countries: Country[]
	restaurants: Restaurant[]
}

export interface Restaurant {
	id: number // Primary key, auto-increment
	name: string // Name of the restaurant
	address: string // Address of the restaurant
	userId: string // Foreign key linking to the User model
	user: User // Relation to the User model
	tables: Table[] // Array of related tables
}

export interface RestaurantBooking {
	id: number // Primary key, auto-increment
	date: Date // Booking date and time
	durationMinutes: number // Duration of the booking in minutes
	tableId: number // Foreign key linking to Table
	userId: string // Foreign key linking to User
	guests: number // Number of guests
	user: User // Relation to the User model
	table: Table // Relation to the Table model
}

export type Table = {
	id: number // Primary key, auto-increment
	number: number // Table number
	capacity: number // Seating capacity of the table
	restaurantId: number // Foreign key to the Restaurant
	restaurant: Restaurant // Relation to the Restaurant model
	userId?: string // Optional foreign key to the User
	user?: User // Optional relation to the User model
	restaurantBookings: RestaurantBooking[] // Array of related bookings
	groupId?: number // Group this table belongs to
	groupName?: string // Name of the group (transient property)
}

export type Notification = {
	open: boolean
	vertical?: "top" | "bottom"
	horizontal?: "center" | "left" | "right"
	message: string
	severity: "error" | "success"
	time?: number
	variant?: "standard" | "filled" | "outlined"
}

export interface EmailTemplate {
	id: number
	name: string
	subject: string
	body: string
	createdAt?: Date
	updatedAt?: Date
	properties: Property[]
	userId: string
	type: string
}

export interface Email {
	templateId: number | null
	to: string
	eventId: number | null
	data: {
		guestName: string
		guestSurname: string
		email: string
		propertyName: string
		propertyAddress: string
		reservationStart: string
		reservationEnd: string
		reservationId: string
		reservationPrice: string
		reservationTax: string
		reservationTotal: string
		lockCode: string
		lockType: string
	}
	newBody: string
	type?: string
}

export interface EmailDataType {
	templateId: number
	to: string | null
	data: PlaceholderNames
}
export interface PlaceholderNames {
	guestName: string
	guestSurname: string
	email: string
	propertyName: string
	propertyAddress: string
	reservationStart: string
	reservationEnd: string
	reservationId: string
	lockCode: string
	lockType: string
}

export interface Lock {
	date: number
	lockAlias: string
	groupId: number
	electricQuantityUpdateDate: number
	lockMac: string
	featureValue: string
	hasGateway: number
	wirelessKeypadFeatureValue: string
	lockName: string
	specialValue: number
	noKeyPwd: string
	passageMode: number
	timezoneRawOffset: number
	lockId: number
	electricQuantity: number
	groupName: string
	bindDate: number
	lockData: string
	keyboardPwdVersion: number
	lockVersion: {
		showAdminKbpwdFlag: boolean
		groupId: number
		protocolVersion: number
		protocolType: number
		orgId: number
		logoUrl: string
		scene: number
	}
}

export interface Passcode {
	endDate: number
	sendDate: number
	keyboardPwdId: number
	nickName: string
	keyboardPwdType: number
	lockId: number
	keyboardPwdVersion: number
	isCustom: number
	keyboardPwdName: string
	keyboardPwd: string
	startDate: number
	senderUsername: string
	receiverUsername: string
	status: number
}

export const placeholderOptions = {
	guest: [
		{ key: "guestName", value: "[[guestName]]" },
		{ key: "guestSurname", value: "[[guestSurname]]" },
		{ key: "email", value: "[[guestEmail]]" },
		// Add more guest placeholders
	],
	property: [
		{ key: "propertyName", value: "[[propertyName]]" },
		{ key: "propertyAddress", value: "[[propertyAddress]]" },
		// Add more property placeholders
	],
	reservation: [
		{ key: "reservationStart", value: "[[reservationStart]]" },
		{ key: "reservationEnd", value: "[[reservationEnd]]" },
		{ key: "reservationId", value: "[[reservationId]]" },
		{ key: "reservationPrice", value: "[[reservationPrice]]" },
		{ key: "reservationTax", value: "[[reservationTax]]" },
		{ key: "reservationTotal", value: "[[reservationTotal]]" },
		// Add more reservation placeholders
	],
	lock: [
		{ key: "lockCode", value: "[[lockCode]]" },
		{ key: "lockType", value: "[[lockType]]" },
		// Add more lock placeholders
	],
}

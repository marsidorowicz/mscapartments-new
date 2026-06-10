/** @format */

// Payment provider names
export type PaymentProvider = "FISERV" | "STRIPE" | "PAYPAL" | "BANK_TRANSFER"

// Payment status values
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | "CANCELLED"

// Transaction types
export type TransactionType = "PAYMENT" | "REFUND" | "CARD_PAYMENT" | "BANK_TRANSFER" | "PAYMENT_CALLBACK" | "PAYMENT_REQUEST"

// Interface for payment data sent to state
export interface PaymentInfo {
	eventId: number | null
	amount: number
	provider?: PaymentProvider
	orderId?: string
	currency?: string
}

// Interface for payment request data
export interface PaymentRequestData {
	amount: number
	currency: string
	eventId?: number
	propertyId?: number
	description?: string
	userId: string
	orderId: string
	provider: PaymentProvider
	redirectSuccess?: string
	redirectFailure?: string
}

// Interface for Fiserv payment response/callback data
export interface FiservPaymentCallbackData {
	eventId?: number | string
	chargeTotal: string
	orderNumber: string
	responseCode: string
	responseText: string
	tokenResponseText?: string
	approvalCode?: string
	paymentType: string
	cardType?: string
	cardNumber?: string
	cardExpiry?: string
	cardholderName?: string
	tokenValue?: string
	userId?: string
	propertyId?: number | string
}

// Interface for sanitized payment data for logging
export interface SanitizedPayload {
	eventId?: number | string
	chargeTotal: string
	orderNumber: string
	responseCode: string
	responseText: string
	paymentType: string
	cardNumber?: string // Will be masked
	cardExpiry?: string // Will be masked
	userId?: string
}

// Interface for payment token data
export interface PaymentTokenData {
	userId: string
	eventId?: number
	propertyId?: number
	provider: PaymentProvider
	tokenValue: string
	cardType?: string
	maskedCardNumber?: string
	expiryMonth?: string
	expiryYear?: string
	cardholderName?: string
	metadata?: string
}

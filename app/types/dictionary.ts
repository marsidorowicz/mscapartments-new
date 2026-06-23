/** @format */

export type Dictionary = {
	title: string
	description: string
	keywords: readonly string[]
	home: {
		hero: {
			title: string
			subtitle: string
			heroTitle?: string
			HeroTitle1?: string
			features?: readonly string[]
			specialOffers?: string
			bookNow?: string
		}
		apartmentsSection?: {
			title: string
			subtitle: string
		}
		locationsSection?: {
			title: string
			subtitle: string
			viewApartments: string
			viewAllApartments: string
			apartments: string
			locations: readonly {
				id: number
				name: string
				description: string
				image: string
				features: readonly string[]
				apartments: number
			}[]
		}
		offersSection?: {
			title: string
			subtitle: string
			validUntil: string
			featuresTitle: string
			featuresSubtitle: string
			checkAvailability: string
			viewAllOffers: string
			contactUs: string
			expand: string
			collapse: string
			offers: readonly {
				id: number
				title: string
				discount: string
				description: string
				validUntil: string
			}[]
			features: readonly string[]
		}
		footer?: {
			companyName: string
			companyDescription: string
			phone: string
			officeAndReservations: string
			businessHours: string
			email: string
			quickLinksTitle: string
			home: string
			apartments: string
			offers: string
			contact: string
			about: string
			locationTitle: string
			location: string
			region: string
			copyright: string
			privacy: string
			terms: string
			cookies: string
		}
		loading?: string
		booking?: {
			title: string
			description: string
			checkIn: string
			checkOut: string
			guests: string
			continue: string
			close: string
			propertyNotAvailable?: string
			suggestAlternatives?: string
			noPropertiesAvailable?: string
			automaticallySelected?: string
		}
		about: {
			title: string
			description: string
			learnMore: string
		}
		features: {
			title: string
			items: readonly {
				title: string
				description: string
			}[]
		}
		reviews: {
			title: string
			reviews: readonly {
				id: number
				rating: string
				content: string
				author: string
				platform: string
			}[]
		}
		contact: {
			title: string
			description: string
			contactButton: string
			bookButton: string
		}
	}
	filters: {
		title: string
		subtitle: string
		unselectAll: string
		close: string
		matching: string
		filterSingular: string
		filterPlural: string
		selected: string
		// Polish specific grammar forms (optional for other languages)
		filterFew?: string // for 2-4 (filtry)
		filterMany?: string // for 5+ (filtrów)
		selectedSingular?: string // wybrany
		selectedFew?: string // wybrane
		selectedMany?: string // wybranych
		places: string
		apartmentSize: string
		personCapacity: string
		personCapacityUnit: string
		lastMinute: string
		lastMinuteOnly: string
		lastMinuteDescription: string
		views: string
		amenities: string
		facilities: string
		accessibility: string
		appliances: string
		bathroom: string
		storage: string
		kitchen: string
		bedroom: string
		other: string
		filters: {
			[key: string]: string
		}
	}
	apartments: {
		guests: string
		beds: string
		singleBeds: string
		doubleBeds: string
		night: string
		nights: string
		viewDetails: string
		view: string
		lastMinuteOffer: string
		cleaningFee: string
		serviceFee: string
		parkingFee: string
		garageFee: string
		free: string
		moreAmenities: string
		showLess: string
		from: string
		backToHome?: string
		description?: string
		propertyDetails?: string
		amenitiesTitle?: string
		totalPrice?: string
		onSiteTitle?: string
		additionalFees?: string
		additionalFeesExplanation?: string
		basketTitle?: string
		basketDescription?: string
		basketEmpty?: string
		basketItemPerStay?: string
		basketTotal?: string
		bookNow?: string
		addToBasket?: string
		dateRangeRequired?: string
		// Search functionality
		searchPlaceholder?: string
		clearSearch?: string
		searchResults?: string
		searchResultsFiltered?: string
		noResults?: string
		searchTooltip?: string
		closeSearchTooltip?: string
		settingsTooltip?: string
		gridViewTooltip?: string
		sliderViewTooltip?: string
		// Property detail labels
		type?: string
		guestsLabel?: string
		bedsLabel?: string
		sizeLabel?: string
		localTax?: string
		// Pricing texts
		lastMinuteOfferText?: string
		percentOff?: string
		priceOnRequest?: string
		propertyTypes: {
			[key: string]: string
		}
		location: string
		viewOnMap: string
		moreAboutPlaceTitle?: string
		closeMenu?: string
		carouselHeader: string
		noApartmentsFound: string
		tryAdjustingSearch: string
	}
	login?: {
		title: string
		subtitle: string
		signInWithGoogle: string
		signInWithGitHub: string
		signOut: string
		acceptTerms: string
		termsRequired: string
		alreadySignedIn: string
		welcomeBack: string
		role: string
		modules: string
		adminDashboard: string
		signIn: string
	}
	paymentSuccess: {
		success: {
			heading: string
			description: string
			approvalCode: string
		}
		fail: {
			heading: string
			description: string
			description_unexpected_status: string
			verification_problem_generic: string
			errorReason: string
			canRetry: string
			cannotRetry: string
			tryAgain: string
			returnToBooking: string
			orderNumber: string
			amount: string
			date: string
			status: string
			nextSteps: string
			errors: {
				internal: string
				card_declined: string
				processing_error: string
				payment_failed: string
				invalid_response: string
				invalid_approval: string
				missing_user: string
			}
		}
		status: {
			COMPLETED: string
			FAILED: string
			PENDING: string
		}
		common: {
			loadingDetails: string
			paymentDetails: string
			orderNumber: string
			amount: string
			status: string
			backToEvent: string
			backToHome: string
			pageNotFound: string
		}
	}
	reservation: {
		apartment: string
		title: string
		loading: string
		accessDenied: string
		notFound: string
		fetchError: string
		rateLimited: string
		pleaseWaitMinutes: string
		invalidToken: string
		authenticationRequired: string
		minutesRemaining: string
		secondsRemaining: string
		tryAgain: string
		goHome: string
		noDetails: string
		eventDetails: string
		eventName: string
		startDate: string
		endDate: string
		placeName: string
		propertyName: string
		guests: string
		paymentDetails: string
		paymentId: string
		paymentStatus: string
		amount: string
		paymentDate: string
		noPaymentInfo: string
		notAvailable: string
		totalPrice: string
		rentalPrice: string
		deposit: string
		remainingToPay: string
		localTax: string
		instructions: string
		checkInTime: string
		checkOutTime: string
		additionalInstructions: string
		createPayment: string
		payNow: string
		refreshOrderId: string
		paymentHistory: string
		paymentNumber: string
		initiatedDate: string
		propertyNotAvailable: string
		paymentOptionLabel: string
		depositMarkupNote: string
		depositMarkupSuffix: string
		orderIdLabel: string
	}
	cookieBar: {
		text: string
		privacy: string
		accept: string
		decline: string
	}
	discountCode: {
		title: string
		label: string
		placeholder: string
		apply: string
		priceBreakdown: string
		basePrice: string
		offerDiscount: string
		offerApplied: string
		discount: string
		cleaningFee: string
		cityTax: string
		parking: string
		pets: string
		breakfast: string
		breakfastNote: string
		babyCrib: string
		total: string
		errors: {
			requiredFields: string
			invalidCode: string
			codeUsed: string
			notValidForProperty: string
			validationFailed: string
		}
	}
	navigation: {
		apartments: string
		apartmentBuildings: string
		houses: string
		offers: string
		zakopaneRooms: string
		joinUs: string
		aboutUs: string
		contact: string
		regulamin: string
		privacy: string
		places: {
			zakopane: string
			krakow: string
			warsaw: string
		}
		menu: string
		close: string
	}
	zakopaneRooms?: {
		title: string
		subtitle: string
		heroTitle: string
		heroSubtitle: string
		aboutTitle: string
		featuresTitle: string
		galleryTitle: string
		activitiesTitle: string
		bookingTitle: string
		bookingSubtitle: string
		contactButton: string
		callButton: string
		features: readonly string[]
		activities: {
			winter: {
				title: string
				description: string
			}
			hiking: {
				title: string
				description: string
			}
			culture: {
				title: string
				description: string
			}
		}
	}
	contactForm: {
		title: string
		subtitle: string
		subtitle2?: string
		officePhoneLabel: string
		officePhone: string
		officeEmailLabel: string
		officeEmail: string
		nameLabel: string
		emailLabel: string
		phoneLabel: string
		messageLabel: string
		requiredNote: string
		error: string
		success: string
		sending: string
		submitButton: string
		privacyPolicy: string // <-- add this for i18n privacy policy text
	}
	calendar: {
		title: string
		subtitle: string
		available: string
		booked: string
		notAvailable: string
	}
	offers: {
		familyTatras: {
			title: string
			shortDescription: string
			fullContent: string
			clickToDetails: string
			close: string
		}
		firstMinute: {
			title: string
			shortDescription: string
			fullContent: string
			clickToDetails: string
			close: string
		}
		romanticStay: {
			title: string
			shortDescription: string
			fullContent: string
			clickToDetails: string
			close: string
		}
		longerStay: {
			title: string
			shortDescription: string
			fullContent: string
			clickToDetails: string
			close: string
		}
		breakfastStay: {
			title: string
			shortDescription: string
			fullContent: string
			clickToDetails: string
			close: string
		}
		lastMinuteWeekend: {
			title: string
			shortDescription: string
			fullContent: string
			clickToDetails: string
			close: string
		}
	}
	offersPage: {
		subtitle: string
		activeOffers: string
		inactiveOffers: string
		offerEnded: string
		offerUnavailable: string
		validUntil: string
		alwaysValid: string
		askForDiscountCode: string
		termsTitle: string
		termsItems: readonly string[]
		contactTitle: string
		contactSubtitle: string
		contactButton: string
		discountCode: {
			title: string
			label: string
			placeholder: string
			apply: string
			priceBreakdown: string
			basePrice: string
			offerDiscount: string
			offerApplied: string
			discount: string
			cleaningFee: string
			cityTax: string
			parking: string
			total: string
			errors: {
				requiredFields: string
				invalidCode: string
				codeUsed: string
				notValidForProperty: string
				validationFailed: string
			}
		}
	}
	placeDetails: {
		apartment: string
		apartments: string
		available: string
		availableApartmentsCount: string
		aboutPlace: string
		welcomeDescription: string
		apartmentDescription: string
		selectionDescription: string
		availableApartments: string
		noApartmentsAvailable: string
		metadata: {
			title: string
			description: string
			keywords: readonly string[]
			placeNotFound: string
			placeNotFoundDescription: string
		}
	}
	houses: {
		title: string
		subtitle: string
		availableCount: string
		noHousesAvailable: string
	}
	apartamenty: {
		guestsLabel: string
		bedroomsLabel: string
		locationLabel: string
		searchByNameLabel: string
		searchByNamePlaceholder: string
		checkAvailability: string
		anyLabel: string
		resultsFound: string
		locations: {
			zakopane: string
			koscielisko: string
		}
	}
}
// Utility types for components that only need specific parts of the dictionary
export type ContactDictionary = Dictionary["contactForm"]
export type ApartmentsDictionary = Dictionary["apartments"]
export type HomeDictionary = Dictionary["home"]
export type LoginDictionary = Dictionary["login"]
export type PaymentSuccessDictionary = Dictionary["paymentSuccess"]
export type ReservationDictionary = Dictionary["reservation"]
export type ReviewsDictionary = Dictionary["home"]["reviews"]
export type CalendarDictionary = Dictionary["calendar"]

/** @format */

import { NextRequest, NextResponse } from "next/server"
import prisma from "@/prisma/prisma"

export async function POST(request: NextRequest) {
    try {
        const {
            codeId,
            campaignId,
            eventId,
            userId,
            originalPrice,
            discountAmount,
            finalPrice,
            guestEmail,
            guestName,
            ipAddress,
            userAgent
        } = await request.json()

        if (!codeId || !campaignId || !eventId || !originalPrice || !discountAmount || !finalPrice) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        // Check if this discount code has already been applied to this event
        const existingUsage = await prisma.campaignUsage.findFirst({
            where: {
                codeId,
                eventId: parseInt(eventId)
            }
        })

        if (existingUsage) {
            return NextResponse.json(
                { error: "Discount code has already been applied to this reservation" },
                { status: 400 }
            )
        }

        // Get campaign to check type
        const campaign = await prisma.discountCampaign.findUnique({
            where: { id: campaignId }
        })

        if (!campaign) {
            return NextResponse.json(
                { error: "Campaign not found" },
                { status: 404 }
            )
        }

        // Create usage record
        const parsedEventId = parseInt(eventId)
        
        const usage = await prisma.campaignUsage.create({
            data: {
                campaignId,
                codeId,
                eventId: parsedEventId,
                userId,
                guestEmail,
                guestName,
                originalPrice: parseFloat(originalPrice),
                discountAmount: parseFloat(discountAmount),
                finalPrice: parseFloat(finalPrice),
                ipAddress,
                userAgent
            }
        })

        // Mark code as used for single-use campaigns
        if (campaign.campaignType === 'SINGLE_USE') {
            await prisma.campaignCode.update({
                where: { id: codeId },
                data: { isUsed: true }
            })
        }

        // Update campaign statistics
        await prisma.discountCampaign.update({
            where: { id: campaignId },
            data: {
                usedCodes: { increment: 1 },
                totalDiscount: { increment: parseFloat(discountAmount) }
            }
        })

        // Log user activity for discount code application
        if (userId) {
            await prisma.userActivity.create({
                data: {
                    userId,
                    activity: `Applied discount code to reservation ${eventId}. Discount: ${discountAmount} PLN`,
                    ipAddress,
                    userAgent,
                    metadata: {
                        codeId,
                        campaignId,
                        eventId: parseInt(eventId),
                        discountAmount: parseFloat(discountAmount),
                        finalPrice: parseFloat(finalPrice),
                        campaignName: campaign.name
                    }
                }
            })
        }

        return NextResponse.json({
            success: true,
            usage
        })
    } catch (error) {
        console.error("Error applying discount code:", error)
        return NextResponse.json(
            { error: "Failed to apply discount code" },
            { status: 500 }
        )
    }
}
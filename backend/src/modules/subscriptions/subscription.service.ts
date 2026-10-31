import { PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '../../server';

export const SubscriptionStatus = {
  DRAFT: 'DRAFT',
  QUOTATION: 'QUOTATION',
  CONFIRMED: 'CONFIRMED',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
} as const;

export type SubscriptionStatus = (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export const ALLOWED_TRANSITIONS: Readonly<Record<SubscriptionStatus, readonly SubscriptionStatus[]>> = {
  [SubscriptionStatus.DRAFT]: [SubscriptionStatus.QUOTATION],
  [SubscriptionStatus.QUOTATION]: [SubscriptionStatus.CONFIRMED, SubscriptionStatus.CLOSED],
  [SubscriptionStatus.CONFIRMED]: [SubscriptionStatus.ACTIVE],
  [SubscriptionStatus.ACTIVE]: [SubscriptionStatus.PAUSED, SubscriptionStatus.CLOSED],
  [SubscriptionStatus.PAUSED]: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CLOSED],
  [SubscriptionStatus.CLOSED]: [], // Terminal state: no outbound transitions permitted
};


export class InvalidStateTransitionError extends Error {
  public readonly code = 'INVALID_STATE_TRANSITION';
  public readonly statusCode = 400;

  constructor(
    public readonly currentStatus: string,
    public readonly targetStatus: string,
    public readonly allowedNextStatuses: readonly string[]
  ) {
    super(
      `Cannot transition subscription from '${currentStatus}' to '${targetStatus}'. ` +
      (allowedNextStatuses.length > 0
        ? `Permitted transitions: [${allowedNextStatuses.join(', ')}].`
        : `State '${currentStatus}' is terminal and cannot be transitioned.`)
    );
    this.name = 'InvalidStateTransitionError';
  }
}

/**
 * Custom Error for Resource Not Found
 */
export class SubscriptionNotFoundError extends Error {
  public readonly code = 'SUBSCRIPTION_NOT_FOUND';
  public readonly statusCode = 404;

  constructor(public readonly subscriptionId: string) {
    super(`Subscription with ID '${subscriptionId}' was not found.`);
    this.name = 'SubscriptionNotFoundError';
  }
}

/**
 * 2. State Transition Validator
 * 
 * Pure predicate function to verify if moving from currentStatus to targetStatus
 * conforms to the defined lifecycle state machine.
 *
 * @param currentStatus - Current lifecycle status of the subscription
 * @param targetStatus - Desired target lifecycle status
 * @returns boolean - True ONLY if transition is strictly permitted
 */
export function validateStateTransition(
  currentStatus: SubscriptionStatus,
  targetStatus: SubscriptionStatus
): boolean {
  // Step 1: Guard against invalid or unrecognized state keys
  const validDestinations = ALLOWED_TRANSITIONS[currentStatus];
  if (!validDestinations) {
    return false;
  }

  // Step 2: Ensure self-transitions (e.g. ACTIVE -> ACTIVE) are disallowed unless explicitly listed
  if (currentStatus === targetStatus) {
    return false;
  }

  // Step 3: Check membership in allowed outbound transitions
  return validDestinations.includes(targetStatus);
}

/**
 * 3. Subscription Status Update Service Function
 * 
 * Orchestrates subscription state updates with data persistence:
 *  - Fetches existing subscription record
 *  - Enforces lifecycle state transition rules
 *  - Persists new status inside a database update/transaction
 * 
 * @param subscriptionId - UUID of the target subscription
 * @param targetStatus - Requested new lifecycle status
 * @param db - Optional PrismaClient instance for dependency injection & transaction support
 * @returns Updated subscription entity
 */
export async function updateSubscriptionStatus(
  subscriptionId: string,
  targetStatus: SubscriptionStatus,
  db: PrismaClient = defaultPrisma
) {
  // --------------------------------------------------------------------------
  // Step 1: Parameter & Type Validation
  // --------------------------------------------------------------------------
  if (!subscriptionId || typeof subscriptionId !== 'string') {
    throw new Error('Subscription ID must be a non-empty string.');
  }

  const validStatuses = Object.values(SubscriptionStatus);
  if (!validStatuses.includes(targetStatus)) {
    throw new Error(
      `Invalid target status '${targetStatus}'. Must be one of: ${validStatuses.join(', ')}.`
    );
  }

  // --------------------------------------------------------------------------
  // Step 2: Fetch Current Subscription Record from Prisma
  // --------------------------------------------------------------------------
  const subscription = await db.subscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    throw new SubscriptionNotFoundError(subscriptionId);
  }

  const currentStatus = subscription.status as SubscriptionStatus;

  // --------------------------------------------------------------------------
  // Step 3: Validate Lifecycle State Machine Transition
  // --------------------------------------------------------------------------
  const isAllowed = validateStateTransition(currentStatus, targetStatus);

  if (!isAllowed) {
    const allowedTransitions = ALLOWED_TRANSITIONS[currentStatus] || [];
    throw new InvalidStateTransitionError(
      currentStatus,
      targetStatus,
      allowedTransitions
    );
  }

  // --------------------------------------------------------------------------
  // Step 4: Persist Status Change in Database
  // --------------------------------------------------------------------------
  // Cast targetStatus to any / Prisma's SubscriptionStatus enum
  const updatedSubscription = await db.subscription.update({
    where: { id: subscriptionId },
    data: {
      status: targetStatus as any,
      // If closing/cancelling, mark canceledAt timestamp
      ...(targetStatus === SubscriptionStatus.CLOSED && {
        canceledAt: new Date(),
      }),
    },
  });

  return updatedSubscription;
}


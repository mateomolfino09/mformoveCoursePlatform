import mongoose from 'mongoose';
import MentorshipPlan from '../../../../models/mentorshipPlanModel';
import User from '../../../../models/userModel';
import { coursePaymentDebug, coursePaymentWarn } from '../../../../lib/coursePaymentDebug';

export type FulfillMentorshipPurchaseInput = {
  planId: string;
  interval: string;
  provider: 'stripe' | 'dlocalgo';
  transactionId: string;
  email?: string | null;
  userId?: string | null;
  orderId?: string | null;
  amount?: number;
  moneda?: string;
};

export type FulfillMentorshipPurchaseResult = {
  alreadyProcessed: boolean;
  userId: string;
  planId: string;
  user: unknown;
};

const hasMentorshipForTransaction = (user: any, transactionId: string) => {
  return user?.mentorship?.subscriptionId === transactionId;
};

export async function fulfillMentorshipPurchase({
  planId,
  interval,
  provider,
  transactionId,
  email,
  userId,
  orderId,
  amount,
  moneda,
}: FulfillMentorshipPurchaseInput): Promise<FulfillMentorshipPurchaseResult> {
  coursePaymentDebug('mentorship.fulfill.start', {
    planId,
    interval,
    provider,
    transactionId,
    userId: userId || undefined,
    email: email || undefined,
    orderId: orderId || undefined,
    amount,
    moneda,
  });

  if (!mongoose.Types.ObjectId.isValid(planId)) {
    throw new Error('Plan de mentoría inválido');
  }

  const plan = await MentorshipPlan.findById(planId);
  if (!plan || !plan.active) {
    coursePaymentWarn('mentorship.fulfill.plan_not_found', { planId, active: plan?.active });
    throw new Error('Plan de mentoría no encontrado o inactivo');
  }

  const priceEntry = plan.prices?.find((p: { interval: string }) => p.interval === interval);
  if (!priceEntry) {
    throw new Error('Intervalo de facturación no encontrado en el plan');
  }

  const duplicateUser = await User.findOne({
    'mentorship.subscriptionId': transactionId,
    'mentorship.planId': planId,
  });

  if (duplicateUser) {
    coursePaymentDebug('mentorship.fulfill.duplicate_transaction', {
      userId: duplicateUser._id.toString(),
      planId,
      transactionId,
    });
    return {
      alreadyProcessed: true,
      userId: duplicateUser._id.toString(),
      planId,
      user: duplicateUser,
    };
  }

  let authenticatedUser = null;
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    authenticatedUser = await User.findById(userId);
    coursePaymentDebug('mentorship.fulfill.user_lookup', {
      by: 'userId',
      found: Boolean(authenticatedUser),
      userId,
    });
  }

  let emailUser = null;
  if (email) {
    const normalizedEmail = email.trim().toLowerCase();
    emailUser = await User.findOne({ email: normalizedEmail });
    coursePaymentDebug('mentorship.fulfill.user_lookup', {
      by: 'email',
      found: Boolean(emailUser),
      email: normalizedEmail,
    });
  }

  let pendingOrderUser = null;
  if (orderId) {
    pendingOrderUser = await User.findOne({ 'pendingMentorshipDlocal.orderId': orderId });
    coursePaymentDebug('mentorship.fulfill.user_lookup', {
      by: 'pendingOrder',
      found: Boolean(pendingOrderUser),
      orderId,
    });
  }

  let user = null;
  if (authenticatedUser && !hasMentorshipForTransaction(authenticatedUser, transactionId)) {
    user = authenticatedUser;
    coursePaymentDebug('mentorship.fulfill.user_selected', {
      by: 'authenticated',
      userId: user._id.toString(),
    });
  } else if (pendingOrderUser) {
    user = pendingOrderUser;
    coursePaymentDebug('mentorship.fulfill.user_selected', {
      by: 'pending_order',
      userId: user._id.toString(),
    });
  } else if (emailUser) {
    user = emailUser;
    coursePaymentDebug('mentorship.fulfill.user_selected', {
      by: 'email',
      userId: user._id.toString(),
    });
  } else if (authenticatedUser) {
    user = authenticatedUser;
    coursePaymentDebug('mentorship.fulfill.user_selected', {
      by: 'authenticated_fallback',
      userId: user._id.toString(),
    });
  }

  if (!user) {
    coursePaymentWarn('mentorship.fulfill.user_not_found', {
      planId,
      provider,
      transactionId,
      userId: userId || undefined,
      email: email || undefined,
      orderId: orderId || undefined,
    });
    throw new Error('No se encontró un usuario para asignar la mentoría');
  }

  if (hasMentorshipForTransaction(user, transactionId)) {
    return {
      alreadyProcessed: true,
      userId: user._id.toString(),
      planId,
      user,
    };
  }

  user.mentorship = {
    active: true,
    planId: plan._id.toString(),
    planName: plan.name,
    planLevel: plan.level,
    interval,
    provider,
    subscriptionId: transactionId,
    startDate: user.mentorship?.startDate || new Date(),
    lastPaymentDate: new Date(),
    status: 'active',
    amount: amount ?? priceEntry.price,
    moneda: moneda || priceEntry.currency || 'USD',
  };

  if (user.pendingMentorshipDlocal?.orderId === orderId) {
    user.pendingMentorshipDlocal = undefined;
  }

  await user.save();

  coursePaymentDebug('mentorship.fulfill.granted', {
    userId: user._id.toString(),
    planId,
    interval,
    provider,
    transactionId,
  });

  return {
    alreadyProcessed: false,
    userId: user._id.toString(),
    planId,
    user,
  };
}

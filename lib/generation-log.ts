import { createServiceClient } from "@/lib/supabase/server";
import {
  type GenerationLogStatus,
  type GenerationServiceType,
} from "@/types/video";

interface CreateLogParams {
  userId: string | null;
  sessionId: string;
  serviceType: GenerationServiceType;
  action: string;
  params?: Record<string, unknown>;
}

interface UpdateLogParams {
  status?: GenerationLogStatus;
  tokensCharged?: number;
  externalTaskId?: string;
  referenceId?: string;
  errorCode?: string;
  errorMessage?: string;
  completedAt?: string;
}

export async function createGenerationLog(
  params: CreateLogParams,
): Promise<string | null> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("generation_log")
    .insert({
      user_id: params.userId,
      session_id: params.sessionId,
      service_type: params.serviceType,
      action: params.action,
      params: params.params ?? {},
      status: "initiated",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create generation log:", error);
    return null;
  }

  return data.id;
}

export async function updateGenerationLog(
  logId: string | null,
  updates: UpdateLogParams,
): Promise<void> {
  if (!logId) return;

  const supabase = createServiceClient();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.status) updateData.status = updates.status;
  if (updates.tokensCharged !== undefined)
    updateData.tokens_charged = updates.tokensCharged;
  if (updates.externalTaskId)
    updateData.external_task_id = updates.externalTaskId;
  if (updates.referenceId) updateData.reference_id = updates.referenceId;
  if (updates.errorCode) updateData.error_code = updates.errorCode;
  if (updates.errorMessage) updateData.error_message = updates.errorMessage;
  if (updates.completedAt) updateData.completed_at = updates.completedAt;

  const { error } = await supabase
    .from("generation_log")
    .update(updateData)
    .eq("id", logId);

  if (error) {
    console.error("Failed to update generation log:", error);
  }
}

export async function refundGenerationLog(
  logId: string,
): Promise<{ refunded: boolean; amount: number }> {
  const supabase = createServiceClient();

  const { data: log, error: fetchError } = await supabase
    .from("generation_log")
    .select("user_id, tokens_charged, tokens_refunded, status")
    .eq("id", logId)
    .single();

  if (fetchError || !log) {
    console.error("Failed to fetch generation log for refund:", fetchError);
    return { refunded: false, amount: 0 };
  }

  const refundable = log.tokens_charged - log.tokens_refunded;
  if (refundable <= 0 || !log.user_id) {
    return { refunded: false, amount: 0 };
  }

  if (log.status === "refunded") {
    return { refunded: false, amount: 0 };
  }

  const { error: rpcError } = await supabase.rpc("refund_tokens", {
    p_user_id: log.user_id,
    p_amount: refundable,
    p_description: `AI 생성 실패 환불 (log: ${logId})`,
    p_reference_id: logId,
  });

  if (rpcError) {
    console.error("Failed to refund tokens:", rpcError);
    return { refunded: false, amount: 0 };
  }

  await supabase
    .from("generation_log")
    .update({
      status: "refunded",
      tokens_refunded: log.tokens_charged,
      updated_at: new Date().toISOString(),
    })
    .eq("id", logId);

  return { refunded: true, amount: refundable };
}

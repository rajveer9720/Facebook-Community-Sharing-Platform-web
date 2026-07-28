import { registerRoute } from '@/mocks/router';
import { MockApiError } from '@/mocks/errors';
import { requireSession, requireRole } from '@/mocks/session';
import { campaigns, groups, registerPendingReward, approvePendingReward, rejectPendingReward, submissions } from '@/mocks/db';
import { createId } from '@/utils/id';
import type { CreateSubmissionRequest, ReviewSubmissionRequest, Submission } from '@/types/submission';

registerRoute('GET', '/submissions', ({ query }) => {
  const workerId = query.get('workerId');
  const status = query.get('status');
  let result = submissions;
  if (workerId) result = result.filter((s) => s.workerId === workerId);
  if (status) result = result.filter((s) => s.status === status);
  return result;
});

registerRoute('POST', '/submissions', ({ body }) => {
  const session = requireSession();
  requireRole(session, 'WORKER');
  const payload = body as CreateSubmissionRequest;

  const campaign = campaigns.find((c) => c.id === payload.campaignId);
  if (!campaign) throw new MockApiError(404, 'Campaign not found');
  const group = groups.find((g) => g.id === payload.groupId);
  if (!group) throw new MockApiError(404, 'Group not found');
  if (!payload.proofUrl?.trim()) throw new MockApiError(400, 'Proof URL is required');

  const submission: Submission = {
    id: createId('sub'),
    campaignId: campaign.id,
    campaignName: campaign.name,
    workerId: session.user.id,
    workerName: `${session.user.firstName} ${session.user.lastName}`,
    groupId: group.id,
    groupName: group.name,
    status: 'PENDING',
    proofUrl: payload.proofUrl,
    caption: payload.caption,
    rewardMinor: campaign.rewardPerPostMinor,
    submittedAt: new Date().toISOString(),
    reviewedAt: null,
    reviewNote: null,
  };
  submissions.unshift(submission);
  registerPendingReward(session.user.id, submission.rewardMinor);
  return submission;
});

registerRoute('POST', '/submissions/:id/review', ({ params, body }) => {
  const session = requireSession();
  requireRole(session, 'ADMIN');

  const submission = submissions.find((s) => s.id === params.id);
  if (!submission) throw new MockApiError(404, 'Submission not found');

  const { decision, note } = body as ReviewSubmissionRequest;
  submission.reviewedAt = new Date().toISOString();
  submission.reviewNote = note ?? null;

  if (decision === 'APPROVE') {
    submission.status = 'APPROVED';
    approvePendingReward(submission.workerId, submission.rewardMinor);
  } else if (decision === 'REJECT') {
    submission.status = 'REJECTED';
    rejectPendingReward(submission.workerId, submission.rewardMinor);
  } else {
    submission.status = 'PENDING';
  }

  return submission;
});

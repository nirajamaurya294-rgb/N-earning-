import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Coins,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task } from '../types';
import { api } from '../api';

interface TaskExecutionModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskCompleted: (rewardPoints: number, isPending: boolean) => void;
}

export const TaskExecutionModal: React.FC<TaskExecutionModalProps> = ({
  task,
  isOpen,
  onClose,
  onTaskCompleted,
}) => {
  if (!isOpen || !task) return null;

  // Video State
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [videoTimer, setVideoTimer] = useState<number>(task.videoDurationSeconds || 20);
  const [isVideoFinished, setIsVideoFinished] = useState<boolean>(false);
  const [videoQuestionAnswer, setVideoQuestionAnswer] = useState<string>('');

  // Survey State
  const [surveyIndex, setSurveyIndex] = useState<number>(0);
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, string>>({});

  // Promo / Proof State
  const [promoTimer, setPromoTimer] = useState<number>(30);
  const [isPromoTimerActive, setIsPromoTimerActive] = useState<boolean>(false);
  const [proofText, setProofText] = useState<string>('');
  const [proofImage, setProofImage] = useState<string>('');

  // General Loading & Error State
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [isSuccessView, setIsSuccessView] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [isManualPending, setIsManualPending] = useState<boolean>(false);

  // Video timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (task.category === 'video' && isPlaying && videoTimer > 0) {
      interval = setInterval(() => {
        setVideoTimer((prev) => {
          if (prev <= 1) {
            setIsVideoFinished(true);
            setIsPlaying(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, videoTimer, task.category]);

  // Promo timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPromoTimerActive && promoTimer > 0) {
      interval = setInterval(() => {
        setPromoTimer((prev) => {
          if (prev <= 1) {
            setIsPromoTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPromoTimerActive, promoTimer]);

  const handleVideoPlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    }
  };

  const handleOpenPromoLink = () => {
    setIsPromoTimerActive(true);
    if (task.externalLink) {
      window.open(task.externalLink, '_blank', 'noopener,noreferrer');
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerConfettiCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10B981', '#059669', '#34D399', '#FBBF24'],
      });
    } catch {}
  };

  const handleSubmit = async () => {
    setError('');
    setSubmitting(true);

    try {
      const payload: any = {};

      if (task.category === 'video') {
        if (!isVideoFinished) {
          setError('Please watch the full video before claiming reward.');
          setSubmitting(false);
          return;
        }
        if (!videoQuestionAnswer) {
          setError('Please select an answer to the verification question.');
          setSubmitting(false);
          return;
        }
        payload.watchedDurationSeconds = task.videoDurationSeconds || 20;
      } else if (task.category === 'survey') {
        payload.surveyAnswers = surveyAnswers;
      }

      if (task.requiresProof) {
        if (!proofText && !proofImage) {
          setError('Please enter proof details (username, reference ID, or upload screenshot).');
          setSubmitting(false);
          return;
        }
        payload.proofText = proofText;
        payload.proofImage = proofImage;
      }

      const res = await api.submitTask(task.id, payload);

      if (res.status === 'approved') {
        triggerConfettiCelebration();
        setIsSuccessView(true);
        setIsManualPending(false);
        setSuccessMessage(`Congratulations! +${task.rewardPoints} Reward Points credited to your wallet.`);
        onTaskCompleted(task.rewardPoints, false);
      } else {
        setIsSuccessView(true);
        setIsManualPending(true);
        setSuccessMessage(
          'Your proof submission has been received. Our admin team will verify it within 24 hours.'
        );
        onTaskCompleted(task.rewardPoints, true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-slate-900 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Modal Header */}
        <div className="px-4 py-3 bg-emerald-700 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <h3 className="text-sm font-bold tracking-tight truncate max-w-[220px]">
              {task.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-emerald-800 rounded-lg transition-colors text-emerald-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {isSuccessView ? (
            /* Success State */
            <div className="text-center py-6 space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                {isManualPending ? (
                  <Sparkles className="w-8 h-8 text-amber-600" />
                ) : (
                  <CheckCircle2 className="w-9 h-9" />
                )}
              </div>
              <h4 className="text-base font-bold text-slate-900">
                {isManualPending ? 'Submission Under Audit' : 'Reward Credited!'}
              </h4>
              <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                {successMessage}
              </p>

              {!isManualPending && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-800 font-bold text-sm font-mono-numbers">
                  <Coins className="w-4 h-4 text-amber-500" />
                  <span>+{task.rewardPoints} Points</span>
                </div>
              )}

              <div className="pt-4">
                <button
                  onClick={onClose}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  Back to Tasks
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Task Reward Header Strip */}
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider block">
                    Task Reward
                  </span>
                  <span className="text-sm font-bold text-slate-900 font-mono-numbers">
                    +{task.rewardPoints} Points (₹{(task.rewardPoints / 10).toFixed(2)})
                  </span>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg text-xs font-semibold text-emerald-800 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{task.requiresProof ? 'Admin Audited' : 'Auto Verified'}</span>
                </div>
              </div>

              {/* 1. VIDEO TASK FLOW */}
              {task.category === 'video' && (
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center">
                    <video
                      ref={videoRef}
                      src={task.videoUrl}
                      className="w-full h-full object-cover"
                      playsInline
                      onEnded={() => {
                        setIsVideoFinished(true);
                        setIsPlaying(false);
                        setVideoTimer(0);
                      }}
                    />
                    {!isPlaying && !isVideoFinished && (
                      <button
                        onClick={handleVideoPlayPause}
                        className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                      >
                        <Play className="w-6 h-6 ml-0.5 fill-current" />
                      </button>
                    )}

                    {/* Overlay Timer */}
                    <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-xs text-white text-[11px] font-mono-numbers px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span>{videoTimer > 0 ? `${videoTimer}s remaining` : 'Finished'}</span>
                    </div>
                  </div>

                  {/* Anti-cheat disclaimer */}
                  <p className="text-[11px] text-slate-500 text-center">
                    Watch the full video to unlock your points. Skipping is disabled.
                  </p>

                  {/* Verification Question once watched */}
                  {isVideoFinished && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 animate-in fade-in">
                      <span className="text-xs font-bold text-slate-800 block">
                        Quick Attention Check:
                      </span>
                      <p className="text-xs text-slate-600">
                        What was the primary educational topic shown in this sponsored clip?
                      </p>
                      <div className="space-y-1.5 pt-1">
                        {[
                          'Digital Payments & Online Financial Safety',
                          'Fast Food Delivery Deals',
                          'Car Racing Video Game',
                        ].map((opt) => (
                          <label
                            key={opt}
                            className={`flex items-center gap-2 p-2 rounded-lg text-xs cursor-pointer border transition-colors ${
                              videoQuestionAnswer === opt
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-semibold'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <input
                              type="radio"
                              name="videoCheck"
                              checked={videoQuestionAnswer === opt}
                              onChange={() => setVideoQuestionAnswer(opt)}
                              className="text-emerald-600 focus:ring-emerald-500"
                            />
                            <span>{opt}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !isVideoFinished || !videoQuestionAnswer}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    {submitting ? 'Verifying...' : 'Claim Video Reward Points'}
                    <Coins className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* 2. SURVEY TASK FLOW */}
              {task.category === 'survey' && task.surveyQuestions && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold text-slate-800">
                      Question {surveyIndex + 1} of {task.surveyQuestions.length}
                    </span>
                    <span className="font-mono-numbers">
                      {Math.round(((surveyIndex + 1) / task.surveyQuestions.length) * 100)}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{
                        width: `${((surveyIndex + 1) / task.surveyQuestions.length) * 100}%`,
                      }}
                    />
                  </div>

                  {/* Current Question */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {task.surveyQuestions[surveyIndex].question}
                    </h4>

                    <div className="space-y-1.5 pt-1">
                      {task.surveyQuestions[surveyIndex].options.map((opt) => {
                        const currentQId = task.surveyQuestions![surveyIndex].id;
                        const isSelected = surveyAnswers[currentQId] === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() =>
                              setSurveyAnswers({ ...surveyAnswers, [currentQId]: opt })
                            }
                            className={`w-full text-left p-2.5 rounded-xl text-xs font-medium border transition-all ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold shadow-xs'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Survey Nav Controls */}
                  <div className="flex items-center gap-2 pt-1">
                    {surveyIndex > 0 && (
                      <button
                        type="button"
                        onClick={() => setSurveyIndex(surveyIndex - 1)}
                        className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Back
                      </button>
                    )}

                    {surveyIndex < task.surveyQuestions.length - 1 ? (
                      <button
                        type="button"
                        disabled={!surveyAnswers[task.surveyQuestions[surveyIndex].id]}
                        onClick={() => setSurveyIndex(surveyIndex + 1)}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>Next Question</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={
                          submitting ||
                          !surveyAnswers[task.surveyQuestions[surveyIndex].id]
                        }
                        onClick={handleSubmit}
                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                      >
                        {submitting ? 'Submitting...' : 'Submit & Claim Reward'}
                        <Coins className="w-3.5 h-3.5 text-amber-300" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 3. PROMO / PARTNER APP TASK FLOW */}
              {(task.category === 'promo' || task.category === 'app' || task.category === 'daily') &&
                !task.surveyQuestions && (
                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
                      <span className="font-bold text-slate-800 block mb-1">
                        Instructions:
                      </span>
                      {task.proofInstructions ||
                        'Click the link below, explore the partner platform for 30 seconds, and return to claim your reward.'}
                    </div>

                    {/* Action Link button */}
                    <button
                      type="button"
                      onClick={handleOpenPromoLink}
                      className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <span>Open Promotional Platform</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    {/* Timer indicator */}
                    <div className="p-2.5 bg-emerald-50/70 border border-emerald-100 rounded-xl flex items-center justify-between text-xs">
                      <span className="text-slate-600">Verification Dwell Timer:</span>
                      <span className="font-bold font-mono-numbers text-emerald-800">
                        {promoTimer > 0 ? `${promoTimer}s remaining` : 'Complete'}
                      </span>
                    </div>

                    {/* Proof input if task requires audit proof */}
                    {task.requiresProof && (
                      <div className="space-y-2 pt-1 border-t border-slate-200">
                        <label className="block text-xs font-bold text-slate-800">
                          Proof of Completion
                        </label>
                        <textarea
                          rows={2}
                          value={proofText}
                          onChange={(e) => setProofText(e.target.value)}
                          placeholder="Enter your registered username, account email, or order reference"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />

                        {/* Screenshot upload simulator */}
                        <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center bg-slate-50 hover:bg-slate-100 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            id="screenshot-input"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <label
                            htmlFor="screenshot-input"
                            className="cursor-pointer flex flex-col items-center justify-center text-xs text-slate-600"
                          >
                            <Upload className="w-4 h-4 text-emerald-600 mb-1" />
                            <span className="font-semibold text-emerald-700">
                              {proofImage ? 'Screenshot Uploaded ✓' : 'Attach Screenshot Proof'}
                            </span>
                            <span className="text-[10px] text-slate-400 mt-0.5">
                              PNG, JPG up to 5MB
                            </span>
                          </label>
                        </div>
                      </div>
                    )}

                    <button
                      type="button"
                      disabled={submitting || promoTimer > 0}
                      onClick={handleSubmit}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {submitting
                        ? 'Verifying...'
                        : task.requiresProof
                        ? 'Submit Proof for Audit'
                        : 'Verify & Claim Reward'}
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

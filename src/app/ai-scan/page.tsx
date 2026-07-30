'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import CameraCapture from '@/components/CameraCapture';
import {
  Upload,
  ScanLine,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Sprout,
  Camera,
} from 'lucide-react';
import { INDIAN_CROPS } from '@/constants/crops';
import { getIndianSeason, SEASONS_INFO } from '@/constants/seasons';
import { useAuth } from '@/context/AuthContext';
import { useScans } from '@/context/ScanContext';
import { apiService } from '@/services/api';
import { PredictResponse } from '@/types';
import { toast } from 'sonner';

export default function AIScanPage() {
  const { user } = useAuth();
  const { addScan } = useScans();

  const [selectedCrop, setSelectedCrop] = useState<string>('auto');
  const [customCrop, setCustomCrop] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [showCamera, setShowCamera] = useState<boolean>(false);

  const season = getIndianSeason(new Date());
  const seasonMeta = SEASONS_INFO[season];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  // Called by CameraCapture once the user taps "Use This Photo".
  // Feeds the captured frame into the exact same state used by
  // file upload / drag-drop, so handleRunScan needs no changes.
  const handleCameraCapture = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setResult(null);
    toast.success('Photo captured. Ready to scan.');
  };

  const handleRunScan = async () => {
    if (!imagePreview) {
      toast.error('Please upload or capture a crop leaf image first');
      return;
    }

    const cropName = selectedCrop === 'auto' ? '' : selectedCrop === 'other' ? customCrop || '' : selectedCrop;

    setAnalyzing(true);
    setResult(null);

    try {
      const formData = new FormData();
      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (cropName) {
        formData.append('crop', cropName);
      }
      formData.append('season', season);
      formData.append('state', user?.state || 'Gujarat');
      formData.append('district', user?.district || 'Junagadh');

      // Call API Service layer
      const response = await apiService.scan.predict(formData);
      setResult(response);

      // Save into ScanContext
      await addScan({
        imageUrl: imagePreview,
        crop: response.crop,
        disease: response.disease,
        confidence: response.confidence,
        severity: response.severity,
        symptoms: response.symptoms,
        recommendations: response.recommendations,
        preventiveMeasures: response.preventiveMeasures,
        season,
        state: user?.state || 'Gujarat',
        district: user?.district || 'Junagadh',
      });

      toast.success(`Diagnosis complete: ${response.disease}`);
    } catch {
      toast.error('Scan prediction failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <AppLayout currentPath="/ai-scan">
      <div className="space-y-6 max-w-5xl mx-auto">
        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <ScanLine className="text-primary" /> AI Crop Leaf Disease Scanner
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Upload a leaf image to get instant AI disease diagnosis, severity score, and treatment
              plan.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-accent border border-primary/20 px-3.5 py-2 rounded-xl">
            <Sprout size={16} className="text-primary" />
            <span className="text-xs font-semibold text-foreground">
              Season: {seasonMeta.name} ({seasonMeta.localName})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Controls: Upload & Crop selection */}
          <div className="lg:col-span-6 space-y-5">
            <div className="card-base">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-foreground">1. Select Target Crop</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">
                  Optional / Auto-Detect
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                    Crop Type
                  </label>
                  <select
                    value={selectedCrop}
                    onChange={(e) => setSelectedCrop(e.target.value)}
                    className="input-field cursor-pointer"
                  >
                    <option value="auto">✨ Auto-Detect Crop (Recommended - AI Model)</option>
                    {INDIAN_CROPS.map((crop) => (
                      <option key={`crop-opt-${crop.id}`} value={crop.name.split(' (')[0]}>
                        {crop.name}
                      </option>
                    ))}
                    <option value="other">Other / Custom Crop</option>
                  </select>
                </div>

                {selectedCrop === 'other' && (
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1.5">
                      Enter Custom Crop Name
                    </label>
                    <input
                      type="text"
                      value={customCrop}
                      onChange={(e) => setCustomCrop(e.target.value)}
                      placeholder="e.g. Mustard, Black Gram, Guava"
                      className="input-field"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Upload Area */}
            <div className="card-base">
              <h2 className="text-base font-bold text-foreground mb-4">2. Upload Leaf Image</h2>

              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-border rounded-2xl p-6 text-center hover:border-primary transition-colors cursor-pointer bg-muted/20"
              >
                {imagePreview ? (
                  <div className="space-y-4">
                    <img
                      src={imagePreview}
                      alt="Crop leaf sample"
                      className="w-full h-56 object-cover rounded-xl border border-border"
                    />
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <label className="btn-secondary text-xs px-3.5 py-2 cursor-pointer">
                        Change Image
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => setShowCamera(true)}
                        className="btn-secondary text-xs px-3.5 py-2 gap-1.5"
                      >
                        <Camera size={14} /> Open Camera
                      </button>
                      <button
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                          setResult(null);
                        }}
                        className="text-xs text-severity-high hover:underline font-semibold"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mx-auto text-primary">
                      <Upload size={28} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Drag and drop leaf image here
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Supports JPG, PNG, WEBP (Max 10MB)
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 flex-wrap mt-2">
                      <label className="btn-secondary text-xs px-4 py-2 cursor-pointer">
                        Browse Files
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => setShowCamera(true)}
                        className="btn-secondary text-xs px-4 py-2 gap-1.5"
                      >
                        <Camera size={14} /> Open Camera
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={handleRunScan}
                disabled={!imagePreview || analyzing}
                className="btn-primary w-full h-12 text-base mt-5 gap-2"
              >
                {analyzing ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <ScanLine size={18} />
                    Run AI Disease Scan
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Results / Skeleton area */}
          <div className="lg:col-span-6">
            <div className="card-base h-full flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground mb-4 flex items-center gap-2">
                  <CheckCircle2 className="text-primary" size={18} /> Diagnosis & Treatment Plan
                </h2>

                {analyzing && (
                  <div className="space-y-4 py-6 animate-pulse">
                    <div className="h-6 bg-muted rounded w-2/3"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-24 bg-muted rounded-xl"></div>
                    <div className="h-20 bg-muted rounded-xl"></div>
                  </div>
                )}

                {!analyzing && !result && (
                  <div className="py-16 text-center text-muted-foreground space-y-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto">
                      <ScanLine size={24} />
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      No Diagnosis Generated Yet
                    </p>
                    <p className="text-xs max-w-xs mx-auto">
                      Upload a leaf photo and click &quot;Run AI Disease Scan&quot; to see real-time
                      disease predictions.
                    </p>
                  </div>
                )}

                {!analyzing && result && (
                  <div className="space-y-5 fade-in-up">
                    {/* Header summary */}
                    <div className="rounded-xl bg-accent border border-primary/20 p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase">
                          Detected Condition
                        </p>
                        <h3 className="text-lg font-bold text-foreground">{result.disease}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Crop: {result.crop} · Season: {result.season}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-primary tabular-nums">
                          {result.confidence}%
                        </span>
                        <p className="text-[10px] text-muted-foreground uppercase font-semibold">
                          Confidence
                        </p>
                      </div>
                    </div>

                    {/* Symptoms */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Observed Symptoms
                      </h4>
                      <ul className="space-y-1.5">
                        {result.symptoms.map((symptom, idx) => (
                          <li
                            key={`sym-${idx}`}
                            className="text-xs text-foreground flex items-start gap-2"
                          >
                            <span className="text-primary font-bold">•</span>
                            <span>{symptom}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommended Treatment */}
                    <div className="rounded-xl bg-severity-medium-bg dark:bg-amber-950/40 border border-severity-medium/30 dark:border-amber-700/40 p-4.5 sm:p-5">
                      <h4 className="text-sm font-bold text-severity-medium dark:text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <AlertCircle size={18} /> Recommended Treatment Plan
                      </h4>
                      <ul className="space-y-2.5">
                        {result.recommendations.map((rec, idx) => (
                          <li
                            key={`rec-${idx}`}
                            className="text-sm sm:text-base text-foreground dark:text-amber-100 font-medium flex items-start gap-2.5 leading-relaxed"
                          >
                            <ChevronRight
                              size={18}
                              className="text-severity-medium dark:text-amber-400 flex-shrink-0 mt-0.5"
                            />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Preventive Measures */}
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Preventive Action
                      </h4>
                      <ul className="space-y-1.5">
                        {result.preventiveMeasures.map((prev, idx) => (
                          <li
                            key={`prev-${idx}`}
                            className="text-xs text-muted-foreground flex items-start gap-2"
                          >
                            <span className="text-muted-foreground font-bold">✓</span>
                            <span>{prev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CameraCapture
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={handleCameraCapture}
      />
    </AppLayout>
  );
}
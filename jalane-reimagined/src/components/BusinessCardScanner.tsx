import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, RotateCcw, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

type ExtractedCard = {
  name: string;
  email: string;
  phone: string;
  company: string;
  job_title: string;
  notes: string;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExtracted: (data: ExtractedCard) => void;
};

export function BusinessCardScanner({ open, onOpenChange, onExtracted }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  }

  async function startCamera() {
    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
    } catch {
      toast.error("Não foi possível aceder à câmara. Use 'Carregar imagem'.");
    }
  }

  useEffect(() => {
    if (open && !preview) void startCamera();
    if (!open) {
      stopCamera();
      setPreview(null);
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function capture() {
    const video = videoRef.current;
    if (!video || !cameraReady) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setPreview(dataUrl);
    stopCamera();
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
      stopCamera();
    };
    reader.readAsDataURL(file);
  }

  function retake() {
    setPreview(null);
    void startCamera();
  }

  async function analyse() {
    if (!preview) return;
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("scan-business-card", {
        body: { imageBase64: preview },
      });
      if (error) throw error;
      if (!data || data.error) throw new Error(data?.error ?? "Falha na análise");
      onExtracted(data as ExtractedCard);
      toast.success("Dados extraídos do cartão");
      onOpenChange(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erro ao analisar cartão");
    } finally {
      setScanning(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Scanner de cartão de visita</DialogTitle>
        </DialogHeader>

        <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          {preview ? (
            <img src={preview} alt="Cartão capturado" className="w-full h-full object-contain" />
          ) : (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
              {!cameraReady && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> A iniciar câmara...
                </div>
              )}
              <div className="absolute inset-6 border-2 border-white/60 rounded-lg pointer-events-none" />
            </>
          )}
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={onFile}
        />

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {preview ? (
            <>
              <Button variant="ghost" onClick={retake} disabled={scanning}>
                <RotateCcw className="h-4 w-4 mr-2" /> Repetir
              </Button>
              <Button onClick={analyse} disabled={scanning}>
                {scanning ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Camera className="h-4 w-4 mr-2" />}
                Extrair dados
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>
                <X className="h-4 w-4 mr-2" /> Cancelar
              </Button>
              <Button variant="outline" onClick={() => fileRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" /> Carregar imagem
              </Button>
              <Button onClick={capture} disabled={!cameraReady}>
                <Camera className="h-4 w-4 mr-2" /> Capturar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

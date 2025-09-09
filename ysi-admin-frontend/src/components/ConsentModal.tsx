import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { ChevronRight, Settings, Users, FileText } from "lucide-react";

interface ConsentModalProps {
  isOpen: boolean;
  onComplete: () => void;
  language: 'EN' | 'ES';
}

export function ConsentModal({ isOpen, onComplete, language }: ConsentModalProps) {
  const [step, setStep] = useState(1);
  const [recordingConsent, setRecordingConsent] = useState(true);
  const [transcriptionConsent, setTranscriptionConsent] = useState(true);
  const [sharingScope, setSharingScope] = useState('team');
  const [roleAccess, setRoleAccess] = useState('participant');

  const text = {
    EN: {
      welcomeTitle: 'Welcome to Global Shapers',
      welcomeSubtitle: 'Let\'s set up your preferences',
      step1Title: 'Recording & Transcription Preferences',
      step1Description: 'Help us understand how you\'d like your Google Meet sessions handled',
      recordingLabel: 'Allow session recording',
      recordingDescription: 'Meeting recordings help capture key insights and can be reviewed later',
      transcriptionLabel: 'Enable AI transcription',
      transcriptionDescription: 'Automatic transcripts make sessions searchable and accessible',
      step2Title: 'Sharing & Access Preferences',
      step2Description: 'Configure how your session data is shared and who can access it',
      sharingLabel: 'Data sharing scope',
      sharingTeam: 'Team members only',
      sharingOrg: 'Organization-wide',
      sharingPublic: 'Public (anonymized)',
      roleLabel: 'Your role',
      roleParticipant: 'Participant',
      roleFacilitator: 'Facilitator',
      roleObserver: 'Observer',
      viewDetails: 'View details',
      next: 'Next',
      agreeAndContinue: 'Agree & Continue',
      changeableNote: 'You can change these settings anytime in your profile.'
    },
    ES: {
      welcomeTitle: 'Bienvenido a Global Shapers',
      welcomeSubtitle: 'Configuremos tus preferencias',
      step1Title: 'Preferencias de Grabación y Transcripción',
      step1Description: 'Ayúdanos a entender cómo te gustaría que se manejen tus sesiones de Google Meet',
      recordingLabel: 'Permitir grabación de sesiones',
      recordingDescription: 'Las grabaciones ayudan a capturar ideas clave y pueden revisarse más tarde',
      transcriptionLabel: 'Habilitar transcripción IA',
      transcriptionDescription: 'Las transcripciones automáticas hacen que las sesiones sean buscables y accesibles',
      step2Title: 'Preferencias de Compartir y Acceso',
      step2Description: 'Configura cómo se comparten los datos de tu sesión y quién puede acceder',
      sharingLabel: 'Alcance para compartir datos',
      sharingTeam: 'Solo miembros del equipo',
      sharingOrg: 'Toda la organización',
      sharingPublic: 'Público (anonimizado)',
      roleLabel: 'Tu rol',
      roleParticipant: 'Participante',
      roleFacilitator: 'Facilitador',
      roleObserver: 'Observador',
      viewDetails: 'Ver detalles',
      next: 'Siguiente',
      agreeAndContinue: 'Aceptar y Continuar',
      changeableNote: 'Puedes cambiar estas configuraciones en cualquier momento en tu perfil.'
    }
  };

  const t = text[language];

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else {
      onComplete();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{t.welcomeTitle}</DialogTitle>
          <DialogDescription className="text-lg">
            {t.welcomeSubtitle}
          </DialogDescription>
        </DialogHeader>

        {step === 1 && (
          <Card className="border-0 shadow-none">
            <CardHeader className="px-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>{t.step1Title}</CardTitle>
                  <CardDescription>{t.step1Description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="cursor-pointer">{t.recordingLabel}</Label>
                  <p className="text-sm text-slate-600">{t.recordingDescription}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm">
                    {t.viewDetails}
                  </Button>
                  <Switch
                    checked={recordingConsent}
                    onCheckedChange={setRecordingConsent}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Label className="cursor-pointer">{t.transcriptionLabel}</Label>
                  <p className="text-sm text-slate-600">{t.transcriptionDescription}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" size="sm">
                    {t.viewDetails}
                  </Button>
                  <Switch
                    checked={transcriptionConsent}
                    onCheckedChange={setTranscriptionConsent}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-0 shadow-none">
            <CardHeader className="px-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>{t.step2Title}</CardTitle>
                  <CardDescription>{t.step2Description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 space-y-6">
              <div className="space-y-3">
                <Label>{t.sharingLabel}</Label>
                <div className="space-y-2">
                  {[
                    { value: 'team', label: t.sharingTeam },
                    { value: 'org', label: t.sharingOrg },
                    { value: 'public', label: t.sharingPublic }
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        sharingScope === option.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setSharingScope(option.value)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          sharingScope === option.value 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-slate-300'
                        }`}>
                          {sharingScope === option.value && (
                            <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>{t.roleLabel}</Label>
                <div className="space-y-2">
                  {[
                    { value: 'participant', label: t.roleParticipant },
                    { value: 'facilitator', label: t.roleFacilitator },
                    { value: 'observer', label: t.roleObserver }
                  ].map((option) => (
                    <div
                      key={option.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        roleAccess === option.value 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setRoleAccess(option.value)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          roleAccess === option.value 
                            ? 'border-blue-500 bg-blue-500' 
                            : 'border-slate-300'
                        }`}>
                          {roleAccess === option.value && (
                            <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <DialogFooter className="flex-col gap-4">
          <Button 
            onClick={handleNext} 
            className="w-full h-12"
            size="lg"
          >
            {step === 1 ? (
              <>
                {t.next}
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              t.agreeAndContinue
            )}
          </Button>
          <p className="text-sm text-slate-600 text-center">
            {t.changeableNote}
          </p>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Modal completo para agendamento de consultas
 * Fluxo multi-step: Cliente → Serviço → Confirmação
 */
export default function AgendamentoModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  prefilledDate = null, 
  prefilledTime = null 
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState([]);
  const [formData, setFormData] = useState({
    // Dados do cliente
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    // Dados do agendamento
    serviceId: '',
    appointmentDate: prefilledDate || '',
    startTime: prefilledTime || '',
    notes: '',
    // Dados calculados
    serviceName: '',
    servicePrice: 0,
    serviceDuration: 60
  });

  // Atualizar dados pré-preenchidos quando mudarem
  useEffect(() => {
    if (prefilledDate || prefilledTime) {
      setFormData(prev => ({
        ...prev,
        appointmentDate: prefilledDate || prev.appointmentDate,
        startTime: prefilledTime || prev.startTime
      }));
    }
  }, [prefilledDate, prefilledTime]);

  // Carregar serviços disponíveis
  useEffect(() => {
    if (isOpen) {
      fetchServices();
    }
  }, [isOpen]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, name, category, price, duration_minutes')
        .eq('active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (err) {
      console.error('Erro ao carregar serviços:', err);
    }
  };

  // Horários disponíveis (pode ser dinâmico futuramente)
  const availableTimes = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Se mudou o serviço, atualizar dados relacionados
      if (field === 'serviceId') {
        const selectedService = services.find(s => s.id === value);
        if (selectedService) {
          updated.serviceName = selectedService.name;
          updated.servicePrice = selectedService.price || 0;
          updated.serviceDuration = selectedService.duration_minutes || 60;
        }
      }
      
      return updated;
    });
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // 1. Verificar se cliente já existe
      let clientId;
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('phone', formData.clientPhone)
        .single();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        // 2. Criar novo cliente
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            full_name: formData.clientName,
            phone: formData.clientPhone,
            email: formData.clientEmail || null,
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      // 3. Criar agendamento
      const { error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          client_id: clientId,
          service_id: formData.serviceId,
          appointment_date: formData.appointmentDate,
          start_time: formData.startTime,
          duration_minutes: formData.serviceDuration,
          status: 'Agendado',
          total_value_charged: formData.servicePrice,
          notes: formData.notes || null,
          created_at: new Date().toISOString()
        });

      if (appointmentError) throw appointmentError;

      // 4. Sucesso
      onSuccess?.();
      handleClose();
      alert('Agendamento realizado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao realizar agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setStep(1);
      setFormData({
        clientName: '',
        clientPhone: '',
        clientEmail: '',
        serviceId: '',
        appointmentDate: '',
        startTime: '',
        notes: '',
        serviceName: '',
        servicePrice: 0,
        serviceDuration: 60
      });
      onClose();
    }
  };

  // Validações por step
  const isStep1Valid = formData.clientName.trim() && formData.clientPhone.trim();
  const isStep2Valid = formData.serviceId && formData.appointmentDate && formData.startTime;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-container-lowest rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/20">
          <h2 className="font-serif text-xl text-on-surface">Agendar Nova Consulta</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="w-8 h-8 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-outline">close</span>
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center py-6 border-b border-outline-variant/20">
          <div className="flex items-center gap-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
                  ${step >= stepNumber 
                    ? 'bg-primary text-on-primary' 
                    : 'bg-surface-container text-outline'
                  }
                `}>
                  {step > stepNumber ? (
                    <span className="material-symbols-outlined text-sm">check</span>
                  ) : (
                    stepNumber
                  )}
                </div>
                {stepNumber < 3 && (
                  <div className={`
                    w-12 h-0.5 mx-2 transition-colors
                    ${step > stepNumber ? 'bg-primary' : 'bg-surface-container'}
                  `} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Dados do Cliente */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="font-serif text-lg text-on-surface mb-2">Dados do Cliente</h3>
                <p className="text-sm text-secondary">Informe os dados de contato da cliente</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    placeholder="Ex: Maria Silva"
                    className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface placeholder-outline"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface placeholder-outline"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      E-mail
                    </label>
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                      placeholder="maria@email.com"
                      className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface placeholder-outline"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Serviço e Data */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="font-serif text-lg text-on-surface mb-2">Serviço e Agendamento</h3>
                <p className="text-sm text-secondary">Escolha o procedimento e defina data e horário</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Procedimento *
                  </label>
                  <select
                    value={formData.serviceId}
                    onChange={(e) => handleInputChange('serviceId', e.target.value)}
                    className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface"
                  >
                    <option value="">Selecione um procedimento</option>
                    {services.map((service) => (
                      <option key={service.id} value={service.id}>
                        {service.name} - R$ {service.price?.toFixed(2) || '0,00'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Data *
                    </label>
                    <input
                      type="date"
                      value={formData.appointmentDate}
                      onChange={(e) => handleInputChange('appointmentDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">
                      Horário *
                    </label>
                    <select
                      value={formData.startTime}
                      onChange={(e) => handleInputChange('startTime', e.target.value)}
                      className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface"
                    >
                      <option value="">Selecione um horário</option>
                      {availableTimes.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">
                    Observações
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Informações adicionais sobre o agendamento..."
                    rows={3}
                    className="w-full px-4 py-3 border border-outline-variant/30 rounded-xl bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-on-surface placeholder-outline resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmação */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <h3 className="font-serif text-lg text-on-surface mb-2">Confirmar Agendamento</h3>
                <p className="text-sm text-secondary">Revise os dados antes de finalizar</p>
              </div>

              <div className="bg-surface-container/30 rounded-xl p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-secondary mb-1">Cliente</p>
                    <p className="text-sm font-medium text-on-surface">{formData.clientName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary mb-1">Telefone</p>
                    <p className="text-sm text-on-surface">{formData.clientPhone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary mb-1">Procedimento</p>
                    <p className="text-sm font-medium text-on-surface">{formData.serviceName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary mb-1">Data e Horário</p>
                    <p className="text-sm text-on-surface">
                      {new Date(formData.appointmentDate).toLocaleDateString('pt-BR')} às {formData.startTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary mb-1">Valor</p>
                    <p className="text-sm font-medium text-primary">
                      R$ {formData.servicePrice.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary mb-1">Duração</p>
                    <p className="text-sm text-on-surface">{formData.serviceDuration} minutos</p>
                  </div>
                </div>
                
                {formData.notes && (
                  <div>
                    <p className="text-xs text-secondary mb-1">Observações</p>
                    <p className="text-sm text-on-surface">{formData.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-outline-variant/20">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-secondary hover:text-on-surface hover:bg-surface-container rounded-xl transition-colors disabled:opacity-50"
              >
                Voltar
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-secondary hover:text-on-surface hover:bg-surface-container rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            
            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                className="px-6 py-2 text-sm font-medium bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próximo
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-2 text-sm font-medium bg-primary text-on-primary rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <span className="material-symbols-outlined animate-spin text-sm">sync</span>
                )}
                Confirmar Agendamento
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
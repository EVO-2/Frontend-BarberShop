import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

interface FAQ {
  pregunta: string;
  respuesta: string;
  abierta: boolean;
}

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent implements OnInit {

  menuMovilAbierto = false;

  faqs: FAQ[] = [
    {
      pregunta: '¿En qué consiste el periodo de prueba gratis de 14 días?',
      respuesta: 'Te damos acceso completo al Plan Pro de forma totalmente gratuita y sin limitaciones por 14 días. Puedes configurar tus sucursales, registrar barberos y recibir citas de clientes. No solicitamos tarjetas de crédito al registrarte.',
      abierta: false
    },
    {
      pregunta: '¿Qué sucede una vez finalice mi periodo de prueba?',
      respuesta: 'Al finalizar los 14 días, el sistema te invitará a elegir uno de nuestros planes de pago (Básico, Pro o Premium) para seguir recibiendo citas. Si no eliges uno de inmediato, tu cuenta entrará en pausa pero tus datos permanecerán seguros.',
      abierta: false
    },
    {
      pregunta: '¿Los pagos son seguros con Wompi?',
      respuesta: 'Sí, procesamos todos nuestros cobros a través de Wompi de Bancolombia, una de las pasarelas de pago más grandes y seguras del país. Tus datos bancarios viajan 100% encriptados y nunca son almacenados en nuestros servidores.',
      abierta: false
    },
    {
      pregunta: '¿Puedo cancelar mi suscripción en cualquier momento?',
      respuesta: 'Totalmente. No hay contratos de permanencia ni cláusulas de amarre. Puedes suspender o cancelar tu plan mensual cuando lo desees desde tu panel de ajustes, sin cargos adicionales ni penalizaciones.',
      abierta: false
    },
    {
      pregunta: '¿Cómo funciona el Bot de WhatsApp integrado?',
      respuesta: 'Es una de nuestras funciones estrella exclusiva del plan Premium. El bot funciona como un asistente virtual 24/7 en tu propia línea de WhatsApp, respondiendo consultas de tus clientes, mostrándoles horarios libres y agendándoles la cita de forma 100% autónoma en tu calendario.',
      abierta: false
    }
  ];

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events.subscribe(() => {
      this.menuMovilAbierto = false;
    });
  }

  toggleMenuMovil() {
    this.menuMovilAbierto = !this.menuMovilAbierto;
  }

  toggleFAQ(index: number) {
    this.faqs[index].abierta = !this.faqs[index].abierta;
  }

  hacerScroll(idSection: string, event?: Event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.menuMovilAbierto = false;
    
    // Usamos un pequeño delay para permitir que el menú móvil termine de cerrarse
    // y evitar cortes abruptos en el scroll smooth
    setTimeout(() => {
      const element = document.getElementById(idSection);
      if (element) {
        // Encontramos la posición vertical absoluta en el documento
        const currentScroll = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
        const elementPosition = element.getBoundingClientRect().top + currentScroll;
        // Restamos el offset de la barra de navegación fija (~95px)
        const offsetPosition = elementPosition - 95;

        // Desplazamos suavemente de forma súper compatible y exacta
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  verCaracteristicas(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.menuMovilAbierto = false;
    Swal.fire({
      title: 'Características de Style Manager',
      html: `
        <div style="text-align: left; font-size: 0.95rem; line-height: 1.5; color: #cbd5e1; max-height: 400px; overflow-y: auto; padding-right: 5px;">
          <p style="margin-top: 0; color: #f8fafc; font-size: 1.05rem;"><strong>Descubre cómo podemos automatizar y hacer crecer tu barbería:</strong></p>
          
          <div style="margin-bottom: 1.25rem; border-left: 3px solid #ffd700; padding-left: 10px;">
            <h4 style="color: #ffd700; margin: 0 0 0.25rem 0;">📅 Agendamiento Inteligente</h4>
            <p style="margin: 0;">Tus clientes agendan sus citas online 24/7 en segundos. El sistema bloquea horarios de forma inteligente para evitar cruces.</p>
          </div>

          <div style="margin-bottom: 1.25rem; border-left: 3px solid #ffd700; padding-left: 10px;">
            <h4 style="color: #ffd700; margin: 0 0 0.25rem 0;">💬 Bot de WhatsApp Integrado (IA)</h4>
            <p style="margin: 0;">Un asistente virtual que atiende a tus clientes, les muestra horarios libres y les agenda la cita en tiempo real de forma 100% autónoma.</p>
          </div>

          <div style="margin-bottom: 1.25rem; border-left: 3px solid #ffd700; padding-left: 10px;">
            <h4 style="color: #ffd700; margin: 0 0 0.25rem 0;">🏢 Multi-Sede & Control Maestro</h4>
            <p style="margin: 0;">Administra múltiples locales o sucursales desde un único panel maestro, manteniendo tus reportes, logos y personalizaciones.</p>
          </div>

          <div style="margin-bottom: 1.25rem; border-left: 3px solid #ffd700; padding-left: 10px;">
            <h4 style="color: #ffd700; margin: 0 0 0.25rem 0;">📊 Control Financiero & Caja</h4>
            <p style="margin: 0;">Monitorea comisiones de barberos, ingresos diarios, salidas y reportes automatizados al final del día directamente en tu correo.</p>
          </div>

          <div style="margin-bottom: 1.25rem; border-left: 3px solid #ffd700; padding-left: 10px;">
            <h4 style="color: #ffd700; margin: 0 0 0.25rem 0;">⭐ Marca Blanca Profesional</h4>
            <p style="margin: 0;">Personaliza el link de agendamiento de tus clientes con tu propio logotipo, colores y banners publicitarios de tu negocio.</p>
          </div>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Excelente',
      confirmButtonColor: '#ffd700',
      background: '#0f172a',
      color: '#f8fafc',
      width: '600px'
    });
  }

  verPlanes(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.menuMovilAbierto = false;
    Swal.fire({
      title: 'Planes a la Medida de tu Barbería',
      html: `
        <div style="text-align: left; font-size: 0.9rem; line-height: 1.5; color: #cbd5e1; max-height: 450px; overflow-y: auto; padding-right: 5px;">
          <p style="margin-top: 0; color: #f8fafc; text-align: center;"><strong>Elige el plan ideal y comienza tu prueba de 14 días gratis</strong></p>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px; color: #cbd5e1;">
            <thead>
              <tr style="border-bottom: 2px solid rgba(255, 215, 0, 0.3); text-align: left;">
                <th style="padding: 8px; color: #fff;">Característica</th>
                <th style="padding: 8px; color: #ffd700; text-align: center;">Básico</th>
                <th style="padding: 8px; color: #ffd700; text-align: center;">Pro</th>
                <th style="padding: 8px; color: #ffd700; text-align: center;">Premium</th>
              </tr>
            </thead>
            <tbody>
              <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                <td style="padding: 8px; font-weight: bold; color: #fff;">Inversión Mensual</td>
                <td style="padding: 8px; text-align: center; color: #cbd5e1;">$45.000</td>
                <td style="padding: 8px; text-align: center; font-weight: bold; color: #fff;">$89.000</td>
                <td style="padding: 8px; text-align: center; color: #cbd5e1;">$150.000</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                <td style="padding: 8px; font-weight: bold; color: #fff;">Profesionales</td>
                <td style="padding: 8px; text-align: center;">Hasta 3</td>
                <td style="padding: 8px; text-align: center; color: #fff; font-weight: bold;">Hasta 10</td>
                <td style="padding: 8px; text-align: center;">Ilimitados</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                <td style="padding: 8px; font-weight: bold; color: #fff;">Agendamiento Online</td>
                <td style="padding: 8px; text-align: center; color: #10b981;">✔</td>
                <td style="padding: 8px; text-align: center; color: #10b981;">✔</td>
                <td style="padding: 8px; text-align: center; color: #10b981;">✔</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                <td style="padding: 8px; font-weight: bold; color: #fff;">Control de Caja & Comisiones</td>
                <td style="padding: 8px; text-align: center; color: #10b981;">✔</td>
                <td style="padding: 8px; text-align: center; color: #10b981;">✔</td>
                <td style="padding: 8px; text-align: center; color: #10b981;">✔</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                <td style="padding: 8px; font-weight: bold; color: #fff;">Multi-Sede (Sucursales)</td>
                <td style="padding: 8px; text-align: center; color: #f87171;">✘</td>
                <td style="padding: 8px; text-align: center; color: #f87171;">✘</td>
                <td style="padding: 8px; text-align: center; color: #10b981;">✔</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                <td style="padding: 8px; font-weight: bold; color: #fff;">Bot de WhatsApp (IA)</td>
                <td style="padding: 8px; text-align: center; color: #f87171;">✘</td>
                <td style="padding: 8px; text-align: center; color: #f87171;">✘</td>
                <td style="padding: 8px; text-align: center; color: #10b981; font-weight: bold;">✔</td>
              </tr>
              <tr style="border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
                <td style="padding: 8px; font-weight: bold; color: #fff;">Marca Blanca & Soporte</td>
                <td style="padding: 8px; text-align: center;">Básico</td>
                <td style="padding: 8px; text-align: center;">Prioritario</td>
                <td style="padding: 8px; text-align: center; color: #10b981; font-weight: bold;">24/7 VIP</td>
              </tr>
            </tbody>
          </table>
          <p style="margin-top: 15px; font-size: 0.8rem; color: #94a3b8; text-align: center;"><em>Todos los planes incluyen activación inmediata y pasarela de pago segura Wompi (Bancolombia).</em></p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Excelente',
      confirmButtonColor: '#ffd700',
      background: '#0f172a',
      color: '#f8fafc',
      width: '650px'
    });
  }

  verPreguntasFrecuentes(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.menuMovilAbierto = false;
    Swal.fire({
      title: 'Preguntas Frecuentes',
      html: `
        <div style="text-align: left; font-size: 0.95rem; line-height: 1.5; color: #cbd5e1; max-height: 400px; overflow-y: auto; padding-right: 5px;">
          
          <div style="margin-bottom: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 0.75rem;">
            <p style="margin: 0 0 0.25rem 0; color: #ffd700; font-weight: bold;">¿El período de prueba es 100% gratuito?</p>
            <p style="margin: 0;">Sí. Te damos 14 días con el Plan Pro completo. No necesitas ingresar tarjetas de crédito ni datos bancarios para registrarte y probar el sistema.</p>
          </div>

          <div style="margin-bottom: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 0.75rem;">
            <p style="margin: 0 0 0.25rem 0; color: #ffd700; font-weight: bold;">¿Cómo funciona la integración con el Bot de WhatsApp?</p>
            <p style="margin: 0;">Es una función exclusiva de nuestro Plan Premium. Conectamos un Bot con Inteligencia Artificial a tu propia línea de WhatsApp comercial para que responda, agende y cancele citas con tus clientes 24/7 sin que tú intervengas.</p>
          </div>

          <div style="margin-bottom: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 0.75rem;">
            <p style="margin: 0 0 0.25rem 0; color: #ffd700; font-weight: bold;">¿Qué pasará con mis datos tras terminar la prueba?</p>
            <p style="margin: 0;">Tu cuenta entrará en pausa pero tus datos, barberos y configuraciones se mantendrán 100% a salvo y encriptados en nuestro servidor. Podrás reanudarlos en el momento en que selecciones uno de nuestros planes.</p>
          </div>

          <div style="margin-bottom: 1rem; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 0.75rem;">
            <p style="margin: 0 0 0.25rem 0; color: #ffd700; font-weight: bold;">¿Los pagos son seguros con Wompi?</p>
            <p style="margin: 0;">Absolutamente. Toda la facturación se procesa directamente a través de Wompi de Bancolombia, una de las pasarelas bancarias líderes y más seguras del país. No almacenamos ningún dato de tarjetas.</p>
          </div>
        </div>
      `,
      icon: 'question',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#ffd700',
      background: '#0f172a',
      color: '#f8fafc',
      width: '600px'
    });
  }

  irALogin(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.router.navigate(['/login']);
  }

  irAOnboarding(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    this.router.navigate(['/onboarding']);
  }

  abrirTerminos(event: Event): void {
    event.preventDefault();
    Swal.fire({
      title: 'Términos y Condiciones de Servicio',
      html: `
        <div style="text-align: left; font-size: 0.95rem; line-height: 1.5; color: #cbd5e1;">
          <h4 style="color: #ffd700; margin-top: 0;">1. Aceptación de los Términos</h4>
          <p>Al acceder y utilizar la plataforma SaaS <strong>Style Manager</strong>, usted acepta cumplir con estos Términos y Condiciones. El acceso a nuestro periodo de prueba de 14 días no requiere tarjeta de crédito.</p>
          
          <h4 style="color: #ffd700;">2. Licencia de Uso</h4>
          <p>Style Manager concede una licencia no exclusiva, intransferible y revocable para utilizar el software de agendamiento y administración comercial de acuerdo con el plan de suscripción seleccionado.</p>
          
          <h4 style="color: #ffd700;">3. Suscripción y Facturación</h4>
          <p>Los pagos mensuales se procesan a través de la pasarela segura <strong>Wompi</strong> de Bancolombia. Puede suspender, cancelar o cambiar su plan de suscripción en cualquier momento sin penalizaciones adicionales.</p>
          
          <h4 style="color: #ffd700;">4. Límites del Servicio</h4>
          <p>Los límites de profesionales, sedes y el Bot de WhatsApp están determinados estrictamente por el plan de suscripción contratado (Básico, Pro o Premium).</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#ffd700',
      background: '#0f172a',
      color: '#f8fafc',
      width: '600px'
    });
  }

  abrirPolitica(event: Event): void {
    event.preventDefault();
    Swal.fire({
      title: 'Política de Privacidad y Habeas Data',
      html: `
        <div style="text-align: left; font-size: 0.95rem; line-height: 1.5; color: #cbd5e1;">
          <h4 style="color: #ffd700; margin-top: 0;">Tratamiento de Datos Personales (Ley 1581 de 2012)</h4>
          <p>En cumplimiento de la Ley de Habeas Data en Colombia, <strong>Style Manager</strong> es responsable del tratamiento de los datos personales suministrados por sus comercios y clientes.</p>
          
          <h5 style="color: #ffd700;">Finalidades:</h5>
          <ul style="padding-left: 20px;">
            <li>Gestión de la cuenta SaaS y parametrización de barberías.</li>
            <li>Procesamiento y agendamiento automático de citas en tiempo real.</li>
            <li>Notificaciones de confirmación y recordatorios a través del Bot de WhatsApp.</li>
            <li>Contacto técnico y comercial de soporte.</li>
          </ul>
          
          <p>Sus datos viajan 100% seguros mediante certificados SSL y no son compartidos con terceros sin su consentimiento expreso.</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: '#ffd700',
      background: '#0f172a',
      color: '#f8fafc',
      width: '600px'
    });
  }

  abrirSoporte(event: Event): void {
    event.preventDefault();
    Swal.fire({
      title: 'Soporte Técnico Especializado',
      html: `
        <div style="text-align: left; font-size: 0.95rem; line-height: 1.5; color: #cbd5e1;">
          <p>¿Tienes alguna duda o necesitas ayuda para configurar tu barbería? Nuestro equipo de soporte está disponible 24/7 en español.</p>
          
          <h5 style="color: #ffd700; margin-bottom: 0.5rem;">Canales Oficiales:</h5>
          <ul style="list-style-type: none; padding-left: 0;">
            <li style="margin-bottom: 0.5rem;">📧 <strong>Correo:</strong> soporte@stylemanager.co</li>
            <li style="margin-bottom: 0.5rem;">💬 <strong>WhatsApp Soporte:</strong> +57 300 123 4567</li>
            <li style="margin-bottom: 0.5rem;">⏰ <strong>Tiempo promedio de respuesta:</strong> menos de 15 minutos.</li>
          </ul>
        </div>
      `,
      icon: 'question',
      confirmButtonText: 'Contactar por WhatsApp',
      showCancelButton: true,
      cancelButtonText: 'Cerrar',
      confirmButtonColor: '#25d366',
      cancelButtonColor: '#64748b',
      background: '#0f172a',
      color: '#f8fafc',
      width: '500px'
    }).then((result) => {
      if (result.isConfirmed) {
        window.open('https://wa.me/573001234567?text=Hola,%20necesito%20soporte%20con%20mi%20plataforma%20Style%20Manager', '_blank');
      }
    });
  }
}

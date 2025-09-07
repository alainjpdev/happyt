import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Heart, Users, BookOpen, Brain, Star, Play, Award, Globe, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useDarkMode } from '../hooks/useDarkMode';
import logohappy from '../assets/logohappy.png';

export const Landing: React.FC = () => {
  const features = [
    {
      icon: Heart,
      title: 'Educación del Corazón',
      description: 'Nacimos 100% del corazón, con Daniela educando en casa a su hija, incorporando métodos educativos especializados'
    },
    {
      icon: Users,
      title: 'Comunidad Impulsada',
      description: 'Hemos crecido a 70 estudiantes, 100% impulsados por la comunidad que reconoce nuestros resultados'
    },
    {
      icon: Brain,
      title: 'Inclusión Neurodiversa',
      description: 'Única oferta educativa para niños neurodiversos en Puerto Aventuras (Autismo, ADHD, otros)'
    }
  ];

  const benefits = [
    'Más de 100 niños impactados positivamente',
    'Método educativo personalizado y efectivo',
    'Inclusión de niños neurodiversos',
    'Educación basada en proyectos transversales',
    'Desarrollo de habilidades para la vida',
    'Comunidad multicultural y solidaria'
  ];

  const faqs = [
    {
      question: '¿Qué hace único a Happy Tribe?',
      answer: 'Somos la única oferta educativa para niños neurodiversos en Puerto Aventuras, con un método personalizado que combina educación del corazón con técnicas especializadas.'
    },
    {
      question: '¿Cómo funciona el método educativo?',
      answer: 'Nuestro método se basa en proyectos transversales que desarrollan habilidades para la vida, adaptándose a las necesidades individuales de cada niño.'
    },
    {
      question: '¿Qué edades atienden?',
      answer: 'Atendemos niños de diferentes edades, desde preescolar hasta primaria, con programas adaptados a cada etapa del desarrollo.'
    }
  ];

  const [dark, setDark] = useDarkMode();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
                    <img src={logohappy} alt="Happy Tribe Logo" className="h-16 w-auto" />
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/login"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link to="/register">
                <Button>Registrarse</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-brand-green-light to-brand-green-medium" style={{background: 'linear-gradient(135deg, #A5C64C 0%, #4B8B3B 100%)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-8">
                    <img src={logohappy} alt="Happy Tribe Logo" className="h-32 w-auto" />
            </div>
            <h1 className="text-5xl font-bold text-brand-brown mb-6">
              Educación del Corazón
              <span className="text-brand-green-medium block">Para Niños Neurodiversos</span>
            </h1>
            <p className="text-xl text-brand-brown mb-8 max-w-3xl mx-auto">
              Única oferta educativa especializada en Puerto Aventuras. Más de 100 niños impactados positivamente con nuestro método personalizado.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="flex items-center">
                  Comenzar Ahora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Ver Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-brown mb-4">
              ¿Por qué elegir Happy Tribe?
            </h2>
            <p className="text-lg text-brand-brown max-w-2xl mx-auto">
              Nacimos del corazón y crecimos con la comunidad. Ofrecemos educación especializada para niños neurodiversos.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow bg-white">
                <div className="w-16 h-16 bg-brand-green-light rounded-lg flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-8 h-8 text-brand-green-medium" />
                </div>
                <h3 className="text-xl font-semibold text-brand-brown mb-2">{feature.title}</h3>
                <p className="text-brand-brown">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Are Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                ¿Quiénes Somos?
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Happy Tribe nació del corazón de Daniela, quien comenzó educando en casa a su hija, incorporando métodos educativos especializados para niños neurodiversos.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Hemos crecido a 70 estudiantes, 100% impulsados por la comunidad que reconoce nuestros resultados y la transformación positiva en los niños.
              </p>
              <div className="flex items-center text-brand-green-medium font-semibold">
                <Award className="w-5 h-5 mr-2" />
                Más de 100 niños impactados positivamente
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Nuestra Misión</h3>
              <p className="text-gray-600 mb-6">
                Proporcionar educación de calidad, inclusiva y personalizada para niños neurodiversos, desarrollando sus habilidades y potencial único.
              </p>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Inclusión neurodiversa</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Método personalizado</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  <span className="text-gray-700">Comunidad solidaria</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Nuestro Impacto
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Hemos transformado la vida de más de 100 niños y sus familias a través de nuestro enfoque educativo único.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                <span className="text-gray-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Preguntas Frecuentes
            </h2>
            <p className="text-lg text-gray-600">
              Resolvemos las dudas más comunes sobre nuestro programa educativo.
            </p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-logo">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            ¿Listo para comenzar el viaje educativo de tu hijo?
          </h2>
          <p className="text-xl text-white mb-8">
            Únete a nuestra comunidad y descubre cómo podemos ayudar a tu hijo a alcanzar su máximo potencial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" className="bg-white text-brand-green-medium hover:bg-gray-100">
                Registrarse Ahora
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-brand-green-medium">
              Contactar
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                      <img src={logohappy} alt="Happy Tribe Logo" className="h-12 w-auto" />
              </div>
              <p className="text-gray-300">
                Educación del corazón para niños neurodiversos. Transformando vidas a través de la educación personalizada.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Programas</h3>
              <ul className="space-y-2 text-gray-300">
                <li>Educación Preescolar</li>
                <li>Educación Primaria</li>
                <li>Apoyo Neurodiverso</li>
                <li>Habilidades para la Vida</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2 text-gray-300">
                <li>Método Educativo</li>
                <li>Proyectos Transversales</li>
                <li>Inclusión</li>
                <li>Comunidad</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Contacto</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Puerto Aventuras, México
                </li>
                <li className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  +52 984 123 4567
                </li>
                <li className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  info@happytribe.edu
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 Happy Tribe. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
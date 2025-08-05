'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { CldImage } from 'next-cloudinary';
import { MentorshipProps } from '../../../types/mentorship';

type PlanPrice = {
  interval: 'trimestral' | 'anual';
  price: number;
  currency: string;
  stripePriceId: string;
};

type MentorshipPlan = {
  _id: string;
  name: string;
  description: string;
  features: string[];
  level: string;
  active: boolean;
  prices: PlanPrice[];
};

interface PremiumMentorshipCardsProps extends MentorshipProps {
  interval: 'trimestral' | 'anual';
  onPlanSelect: (plan: MentorshipPlan) => void;
  loadingPlanId: string | null;
  setInterval?: (interval: 'trimestral' | 'anual') => void;
}

const PremiumMentorshipCards = ({ plans, interval, onPlanSelect, loadingPlanId, setInterval }: PremiumMentorshipCardsProps) => {
  
  const getLevelConfig = (level: string) => {
    switch (level) {
      case 'explorer':
        return { 
          icon: '○',
          gradient: 'from-emerald-600 via-teal-800 to-cyan-900',
          bgGradient: 'from-emerald-50 to-teal-100',
          accent: 'bg-emerald-600',
          title: 'Explorador',
          subtitle: 'Ideal para comenzar',
          backgroundImage: 'my_uploads/plaza/DSC03370_l1kh3e'
        };
      case 'practitioner':
        return { 
          icon: '◇',
          gradient: 'from-[#234C8C] via-blue-700 to-blue-900',
          bgGradient: 'from-[#234C8C]/10 to-blue-900',
          accent: 'bg-[#234C8C]',
          title: 'Practicante',
          subtitle: 'Más popular',
          backgroundImage: 'my_uploads/plaza/DSC03365_y5bgqb'
        };
      case 'student':
        return { 
          icon: '◆',
          gradient: 'from-orange-700 via-red-800 to-rose-900',
          bgGradient: 'from-orange-100 to-red-200',
          accent: 'bg-orange-700',
          title: 'Estudiante',
          subtitle: 'Máximo nivel',
          backgroundImage: 'my_uploads/plaza/DSC03366_ctiejt'
        };
      default:
        return { 
          icon: '□',
          gradient: 'from-slate-600 to-gray-800',
          bgGradient: 'from-slate-50 to-gray-100',
          accent: 'bg-slate-600',
          title: 'Plan',
          subtitle: 'Básico',
          backgroundImage: 'my_uploads/plaza/DSC03350_vgjrrh'
        };
    }
  };

  const getMissingFeatures = (currentPlan: MentorshipPlan, allPlans: MentorshipPlan[]) => {
    const currentFeatures = new Set(currentPlan.features);
    const allFeatures = new Set<string>();
    
    allPlans.forEach(plan => {
      plan.features.forEach(feature => allFeatures.add(feature));
    });
    
    return Array.from(allFeatures).filter(feature => !currentFeatures.has(feature));
  };

  return (
    <div className="w-full bg-white pb-20 px-4">
      <div className="max-w-[1600px] mx-auto">

        {/* Section Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="text-center mb-16 pt-12"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Decorative elements */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[#234C8C] to-transparent rounded-full"></div>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#234C8C] via-blue-600 to-blue-700 bg-clip-text text-transparent">
                Planes de
              </span>
              <br />
              <span className="bg-gradient-to-r from-gray-800 via-gray-900 to-black bg-clip-text text-transparent">
                Mentoría
              </span>
            </h2>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Elige el camino que mejor se adapte a tu transformación
            </p>
          </motion.div>
        </motion.div>

                 {/* Compact Comparison Table */}
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.4 }}
           viewport={{ once: true }}
           className="mb-20"
           data-table-section
         >
                     <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
             <motion.div 
               initial={{ opacity: 0, y: 10 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.3, delay: 0.1 }}
               viewport={{ once: true }}
               className="p-6 md:p-8 border-b border-gray-200"
             >
               <h3 className="text-xl md:text-2xl font-bold text-gray-800 text-center mb-2">
                 Comparación de Beneficios
               </h3>
               <p className="text-gray-600 text-center text-sm md:text-base">
                 Ver qué incluye cada plan
               </p>
             </motion.div>
             
             {/* Desktop Table */}
             <div className="hidden md:block overflow-x-auto">
               <table className="w-full">
                 <thead className="bg-gray-50">
                   <tr>
                     <th className="px-4 md:px-6 py-3 md:py-4 text-left text-sm font-semibold text-gray-700">Beneficio</th>
                     {plans.map((plan) => (
                       <th key={plan._id} className="px-4 md:px-6 py-3 md:py-4 text-center text-sm font-semibold text-gray-700">
                         {getLevelConfig(plan.level).title}
                       </th>
                     ))}
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-200">
                   {/* Get all unique features */}
                   {(() => {
                     const allFeatures = new Set<string>();
                     plans.forEach(plan => {
                       plan.features.forEach(feature => allFeatures.add(feature));
                     });
                     return Array.from(allFeatures).map((feature, index) => (
                       <tr key={feature} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                         <td className="px-4 md:px-6 py-3 md:py-4 text-sm text-gray-700 font-medium">
                           {feature}
                         </td>
                         {plans.map((plan) => (
                           <td key={plan._id} className="px-4 md:px-6 py-3 md:py-4 text-center">
                             {plan.features.includes(feature) ? (
                               <CheckIcon className="w-5 h-5 text-green-600 mx-auto" />
                             ) : (
                               <XMarkIcon className="w-5 h-5 text-gray-400 mx-auto" />
                             )}
                           </td>
                         ))}
                       </tr>
                     ));
                   })()}
                 </tbody>
               </table>
             </div>

             {/* Mobile Cards */}
             <div className="md:hidden">
               {(() => {
                 const allFeatures = new Set<string>();
                 plans.forEach(plan => {
                   plan.features.forEach(feature => allFeatures.add(feature));
                 });
                 return Array.from(allFeatures).map((feature, index) => (
                   <div key={feature} className={`p-4 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200 last:border-b-0`}>
                     <div className="font-medium text-sm text-gray-700 mb-3">{feature}</div>
                     <div className="grid grid-cols-3 gap-2">
                       {plans.map((plan) => (
                         <div key={plan._id} className="text-center">
                           <div className="text-xs text-gray-500 mb-1">{getLevelConfig(plan.level).title}</div>
                           {plan.features.includes(feature) ? (
                             <CheckIcon className="w-4 h-4 text-green-600 mx-auto" />
                           ) : (
                             <XMarkIcon className="w-4 h-4 text-gray-400 mx-auto" />
                           )}
                         </div>
                       ))}
                     </div>
                   </div>
                 ));
               })()}
             </div>
           </div>
        </motion.div>

        {/* Subtle Interval Filters */}
        {setInterval && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mb-16"
          >
            <div className="flex bg-gray-100 rounded-2xl p-1 shadow-sm">
              <button
                className={`px-6 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  interval === 'trimestral' 
                    ? 'bg-white text-gray-800 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setInterval('trimestral')}
              >
                Trimestral
              </button>
              <button
                className={`px-6 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                  interval === 'anual' 
                    ? 'bg-white text-gray-800 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
                onClick={() => setInterval('anual')}
              >
                Anual (-15%)
              </button>
            </div>
          </motion.div>
        )}

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan, index) => {
            const priceObj = plan.prices?.find((p: PlanPrice) => p.interval === interval);
            if (!priceObj) return null;
            
            const isPopular = plan.level === 'practitioner';
            const config = getLevelConfig(plan.level);
            const missingFeatures = getMissingFeatures(plan, plans);
            const isBestPlan = missingFeatures.length === 0; // Plan con todas las características

            return (
              <motion.div
                key={plan._id + '-' + interval}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className={`relative group h-full ${isPopular ? 'lg:scale-110 z-10' : ''} ${isBestPlan ? 'lg:scale-108 z-15' : ''}`}
              >
                {/* Glow Effect */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 0.2 }}
                  transition={{ duration: 0.3 }}
                  className={`absolute -inset-1 bg-gradient-to-r ${config.gradient} rounded-3xl blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
                ></motion.div>
                
                {/* Main Card */}
                <div className={`relative bg-gradient-to-br ${config.bgGradient} backdrop-blur-xl rounded-3xl shadow-2xl h-full flex flex-col`}>
                  
                  {/* Best Plan Badge - Elegant */}
                  {isBestPlan && (
                    <motion.div 
                      initial={{ scale: 0, y: -10 }}
                      whileInView={{ scale: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="absolute -top-3 inset-x-0 z-30 flex justify-center"
                    >
                      <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white px-6 py-2 rounded-full font-semibold text-sm shadow-xl border border-gray-600/30 backdrop-blur-sm whitespace-nowrap">
                        Más Completo
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Popular Badge - Elegant */}
                  {isPopular && !isBestPlan && (
                    <motion.div 
                      initial={{ scale: 0, y: -10 }}
                      whileInView={{ scale: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      viewport={{ once: true }}
                      className="absolute -top-3 inset-x-0 z-30 flex justify-center"
                    >
                      <div className="bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 text-white px-6 py-2 rounded-full font-semibold text-sm shadow-xl border border-gray-500/30 backdrop-blur-sm whitespace-nowrap">
                        Más Popular
                      </div>
                    </motion.div>
                  )}

                  {/* Header Section with Background Image */}
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    viewport={{ once: true }}
                    className={`relative px-8 pt-12 pb-8 bg-gradient-to-br ${config.gradient} text-white overflow-hidden rounded-t-3xl flex-shrink-0`}
                  >
                    {/* Background Image Overlay with Cloudinary */}
                    <div className="absolute inset-0 opacity-20">
                      <CldImage
                        src={config.backgroundImage}
                        width={800}
                        height={600}
                        alt={`${config.title} background`}
                        className="object-cover object-center w-full h-full"
                        preserveTransformations
                      />
                    </div>
                    
                    {/* Dark Overlay for better text readability */}
                    <div className="absolute inset-0 bg-black/30"></div>
                    
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl"></div>
                      <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full blur-2xl"></div>
                    </div>
                    
                    <div className="relative z-10 text-center">
                                             {/* Icon */}
                       <div className="inline-flex items-center justify-center w-12 h-12 bg-white/10 rounded-full mb-4 backdrop-blur-sm border border-white/20">
                         <span className="text-2xl font-light text-white/90">{config.icon}</span>
                       </div>
                      
                      {/* Title */}
                      <h3 className="text-3xl font-bold mb-2">{config.title}</h3>
                      <p className="text-white/90 text-sm mb-6">
                        {isBestPlan ? 'Discípulo' : config.subtitle}
                      </p>
                      
                      {/* Price */}
                      <div className="mb-4">
                        <div className="text-3xl font-semibold mb-1">U$S {priceObj.price}</div>
                        <div className="text-white/70 text-xs">/{interval === 'trimestral' ? 'trimestre' : 'año'}</div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-white/90 text-sm leading-relaxed max-w-sm mx-auto">
                        {plan.description}
                      </p>
                    </div>
                  </motion.div>

                  {/* Content Section */}
                  <div className="p-8 bg-white/95 backdrop-blur-sm flex-1 flex flex-col rounded-b-3xl">
                    {/* Subtle indicator for complete plan */}
                    {isBestPlan && (
                      <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg flex-shrink-0">
                        <div className="text-center">
                          <p className="text-sm text-blue-700 font-medium">
                            ✓ Plan completo con todos los beneficios disponibles
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Compact Features Comparison */}
                    <div className="mb-8 flex-1">
                      <h4 className="font-bold text-gray-800 text-sm mb-4 flex items-center">
                        <CheckIcon className="w-4 h-4 mr-2 text-gray-600" />
                        BENEFICIOS INCLUIDOS
                      </h4>
                      
                      {/* Features List - Compact Design */}
                      <div className="space-y-2">
                        {plan.features.map((feature, featureIndex) => (
                          <motion.div 
                            key={featureIndex}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: featureIndex * 0.05 }}
                            className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <CheckIcon className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </motion.div>
                        ))}
                      </div>

                                             {/* Missing Features Indicator - Only if there are missing features */}
                       {missingFeatures.length > 0 && (
                         <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                           <div className="flex items-center space-x-2 mb-2">
                             <XMarkIcon className="w-4 h-4 text-gray-500" />
                             <span className="text-sm font-medium text-gray-600">
                               {missingFeatures.length} beneficios adicionales en planes superiores
                             </span>
                           </div>
                           <div className="text-xs text-gray-500">
                             Incluye: {missingFeatures.slice(0, 3).join(', ')}
                             {missingFeatures.length > 3 && ` y ${missingFeatures.length - 3} más`}
                           </div>
                         </div>
                       )}
                    </div>

                                         {/* Stats */}
                     <div className="grid grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-2xl flex-shrink-0">
                       <div className="text-center">
                         <div className="text-2xl font-bold text-gray-800">{plan.features.length}</div>
                         <div className="text-xs text-gray-500">Beneficios</div>
                       </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">
                          {interval === 'trimestral' ? '3' : '12'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {interval === 'trimestral' ? 'meses' : 'meses'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-800">24/7</div>
                        <div className="text-xs text-gray-500">Soporte</div>
                      </div>
                    </div>

                                         {/* CTA Button */}
                     <div className="relative group">
                       {/* Glow Effect */}
                       <div className="absolute -inset-1 bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                       
                       <button
                         onClick={() => onPlanSelect(plan)}
                         disabled={loadingPlanId === plan._id || !plan.active}
                         className="relative w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-500 text-white shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95 flex-shrink-0 bg-gradient-to-r from-gray-900 via-black to-gray-800 hover:from-black hover:to-gray-900 shadow-black/30 hover:shadow-black/50 border border-gray-700/50 hover:border-gray-600/50 backdrop-blur-sm"
                       >
                      {loadingPlanId === plan._id ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                          Procesando...
                        </div>
                      ) : (
                                                 <div className="flex items-center justify-center">
                           <span className="text-sm mr-2 opacity-80">{config.icon}</span>
                           Comenzar {config.title}
                         </div>
                      )}
                    </button>
                  </div>

                    {/* Value Proposition */}
                    <div className="mt-6 text-center flex-shrink-0">
                      <div className="text-xs text-gray-500 mb-2">
                        Garantía de satisfacción • Cancela cuando quieras
                      </div>
                      {interval === 'anual' && (
                        <div className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                          Ahorra 15% con plan anual
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="text-center mt-20"
        >
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-3xl p-12 max-w-4xl mx-auto shadow-xl">
            <h3 className="text-4xl font-bold text-gray-800 mb-6">
            ¿Por qué el compromiso trimestral?
            </h3>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            La transformación real requiere tiempo y constancia. Un trimestre nos permite establecer hábitos sólidos, ver progresos significativos y crear una base duradera para tu práctica de movimiento. No buscamos resultados rápidos, buscamos cambios que perduren.


            </p>
                         <div className="flex flex-wrap justify-center gap-4">
               <a 
                 href="https://forms.gle/your-survey-link" 
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="bg-black text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors cursor-pointer"
               >
                 Hablar con Mateo
               </a>
               <button 
                 onClick={() => {
                   const tableElement = document.querySelector('[data-table-section]');
                   if (tableElement) {
                     tableElement.scrollIntoView({ 
                       behavior: 'smooth', 
                       block: 'start' 
                     });
                   }
                 }}
                 className="border border-gray-300 text-gray-700 px-8 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors cursor-pointer"
               >
                 Ver comparación completa
               </button>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PremiumMentorshipCards; 
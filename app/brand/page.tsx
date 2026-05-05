'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IZIPISLogo } from '@/components/Logo';
import { 
  Box, FileText, PieChart, Users, Settings, Package, 
  Info, ShieldCheck, Zap, Target, ArrowRight, Download,
  CreditCard, Smartphone, Layout
} from 'lucide-react';

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-[#F9F7F2] text-[#2D2D2D] selection:bg-[#E87A5D] selection:text-white font-sans">
      {/* Smooth Entrance Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-8 pt-16 pb-24"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <IZIPISLogo variant="horizontal" className="scale-110" />
          <div className="flex flex-col items-center md:items-end">
            <h1 className="text-5xl font-black tracking-tighter text-[#0D3335]">BRAND MANUAL</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="h-px w-8 bg-[#E87A5D]" />
              <p className="text-[#1A5F60] font-bold uppercase tracking-[0.3em] text-xs">Identity & Engineering v1.0</p>
            </div>
          </div>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-8 space-y-40 pb-40">
        
        {/* 01. CONSTRUCTIVE GRID & LOGO */}
        <SectionNumber number="01" title="Constructive Geometry" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="aspect-square bg-white rounded-[3rem] shadow-2xl shadow-[#0D3335]/5 p-16 relative overflow-hidden group cursor-pointer"
          >
            {/* The Logo with Grid Background */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <div className="h-full w-full" style={{ backgroundImage: 'radial-gradient(#0D3335 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            </div>
            <IZIPISLogo variant="icon" className="w-full h-full relative z-10" />
            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
              <div className="text-[10px] font-mono opacity-40 leading-none">
                GRID_SYSTEM: 100x100<br/>
                Z_ANGLE: 45°<br/>
                BORDER_RADIUS: 2px
              </div>
              <div className="px-3 py-1 bg-[#0D3335] text-white text-[8px] font-bold uppercase tracking-widest rounded-full">
                Precision Matrix
              </div>
            </div>
          </motion.div>
          <div className="space-y-8">
            <h3 className="text-3xl font-black text-[#0D3335] leading-tight">A malha construtiva baseia-se em rigor técnico e equilíbrio visual.</h3>
            <p className="text-lg text-foreground/70 leading-relaxed">
              O símbolo "Z" foi desenhado sobre uma grade de 100x100 unidades, utilizando ângulos de 45 graus para transmitir dinamismo e barras horizontais sólidas para representar estabilidade. O ponto de acento em Coral Suave simboliza a precisão do dado final.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white rounded-2xl border border-[#0D3335]/5">
                <ShieldCheck className="text-[#E87A5D] mb-3" />
                <h4 className="font-bold text-[#0D3335]">Zona de Respiro</h4>
                <p className="text-xs opacity-60">Área mínima de 2x o tamanho do acento ao redor do logo.</p>
              </div>
              <div className="p-6 bg-white rounded-2xl border border-[#0D3335]/5">
                <Target className="text-[#E87A5D] mb-3" />
                <h4 className="font-bold text-[#0D3335]">Foco Analítico</h4>
                <p className="text-xs opacity-60">Elementos centralizados para foco em gestão de dados.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 02. COLOR ARCHITECTURE */}
        <SectionNumber number="02" title="Color Architecture" />
        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <ColorCard hex="#0D3335" name="Deep Teal" usage="Brand Core" desc="Autoridade e Seriedade" text="white" />
            <ColorCard hex="#1A5F60" name="Vibrant Teal" usage="Interactive" desc="Ação e Movimento" text="white" />
            <ColorCard hex="#E87A5D" name="Soft Coral" usage="Attention" desc="Precisão e Alerta" text="white" />
            <ColorCard hex="#F9F7F2" name="Off-White" usage="Surface" desc="Conforto Visual" text="#2D2D2D" border />
            <ColorCard hex="#2D2D2D" name="Graphite" usage="Typography" desc="Contraste e Leitura" text="white" />
          </div>
          <div className="p-12 bg-[#0D3335] rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
            <div className="flex-1 space-y-6 relative z-10">
              <h3 className="text-3xl font-black">Teoria da Cor</h3>
              <p className="opacity-70 text-lg">
                Nossa paleta evita o contraste agressivo do preto absoluto e do branco puro. O uso de Deep Teal com Off-White cria um ambiente de software sofisticado e menos cansativo para longas horas de operação.
              </p>
            </div>
            <div className="flex gap-2">
              {[1, 0.8, 0.6, 0.4, 0.2].map(op => (
                <div key={op} className="w-16 h-40 rounded-full bg-[#E87A5D]" style={{ opacity: op }} />
              ))}
            </div>
          </div>
        </div>

        {/* 03. TYPOGRAPHY SYSTEM */}
        <SectionNumber number="03" title="Typography System" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="space-y-10">
            <div className="group">
              <p className="text-xs font-black text-[#E87A5D] uppercase tracking-[0.4em] mb-4">Primary / Display</p>
              <h4 className="text-8xl font-black text-[#0D3335] leading-none tracking-tighter transition-all group-hover:tracking-normal">MONTSERRAT</h4>
              <p className="mt-6 text-xl text-[#0D3335]/60 font-medium">Extra Bold 800 - Para títulos que exigem impacto e solidez industrial.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(l => (
                <span key={l} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg font-black text-[#0D3335] shadow-sm">{l}</span>
              ))}
            </div>
          </div>
          <div className="space-y-10">
            <div className="">
              <p className="text-xs font-black text-[#1A5F60] uppercase tracking-[0.4em] mb-4">Secondary / Reading</p>
              <h4 className="text-8xl font-light text-[#0D3335] leading-none tracking-tight">Roboto</h4>
              <p className="mt-6 text-xl text-[#0D3335]/60 font-medium">Regular 400 - Otimizada para densidade de dados e clareza em tabelas.</p>
            </div>
            <p className="text-2xl leading-relaxed text-[#2D2D2D]">
              O Izipis equilibra a força visual de seus títulos com uma interface de leitura limpa, garantindo que a informação seja sempre a protagonista do sistema.
            </p>
          </div>
        </div>

        {/* 04. APPLICATIONS (MOCKUPS) */}
        <SectionNumber number="04" title="Application Mockups" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mockup: Business Card */}
          <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-[#0D3335]/5 border border-[#0D3335]/5 flex flex-col justify-between aspect-video relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E87A5D]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#E87A5D]/20 transition-colors" />
            <IZIPISLogo variant="horizontal" className="scale-75 origin-left" />
            <div className="space-y-1 relative z-10">
              <p className="text-2xl font-black text-[#0D3335]">Eng. Requisitos</p>
              <p className="text-[#1A5F60] font-bold tracking-widest text-xs uppercase">Identity Division</p>
            </div>
            <div className="flex justify-between items-center mt-8">
              <div className="text-[10px] font-mono opacity-40">
                IZIPIS_HQ / 2026<br/>
                MANAGEMENT_SOFTWARE
              </div>
              <CreditCard className="text-[#0D3335]/20" size={40} />
            </div>
          </div>

          {/* Mockup: Mobile Interface */}
          <div className="bg-[#0D3335] rounded-[3rem] p-12 shadow-2xl shadow-[#0D3335]/20 flex items-center justify-center aspect-video relative overflow-hidden group">
            <div className="w-48 h-80 bg-[#F9F7F2] rounded-[2.5rem] border-[6px] border-white/10 p-4 flex flex-col gap-4 shadow-2xl transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
              <div className="w-8 h-1 bg-[#0D3335]/10 rounded-full mx-auto mb-2" />
              <div className="flex items-center justify-between">
                <IZIPISLogo variant="icon" className="scale-50" />
                <div className="w-6 h-6 rounded-full bg-[#E87A5D]/10 flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-[#E87A5D]" />
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <div className="h-4 w-2/3 bg-[#0D3335]/5 rounded-md" />
                <div className="h-12 w-full bg-[#0D3335]/10 rounded-xl" />
                <div className="h-12 w-full bg-[#0D3335]/10 rounded-xl" />
              </div>
              <div className="mt-auto h-10 w-full bg-[#1A5F60] rounded-xl flex items-center justify-center text-white text-[10px] font-bold uppercase tracking-widest">
                LOGIN
              </div>
            </div>
            <div className="absolute left-12 bottom-12 space-y-2">
              <h4 className="text-white text-2xl font-black">App Mobile</h4>
              <p className="text-white/50 text-xs uppercase tracking-widest font-bold">Resumo na palma da mão</p>
            </div>
          </div>

          {/* Mockup: Technical Documentation */}
          <div className="md:col-span-2 bg-gradient-to-br from-white to-[#F9F7F2] rounded-[3rem] p-16 shadow-2xl shadow-[#0D3335]/5 border border-[#0D3335]/5 flex flex-col md:flex-row items-center gap-16 group">
            <div className="w-64 h-80 bg-white shadow-2xl rounded-sm border-l-[12px] border-[#0D3335] p-8 flex flex-col justify-between transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <IZIPISLogo variant="icon" className="scale-75 origin-left" />
              <div className="space-y-2">
                <div className="h-1 w-8 bg-[#E87A5D]" />
                <p className="font-black text-xl leading-tight">RELATÓRIO DE REQUISITOS</p>
                <p className="text-[10px] opacity-40 font-mono">v.2.4.0 / DASHBOARD</p>
              </div>
            </div>
            <div className="flex-1 space-y-6">
              <h4 className="text-4xl font-black text-[#0D3335]">Documentação Técnica</h4>
              <p className="text-lg opacity-70">
                Cada relatório gerado pelo sistema segue o padrão de identidade, utilizando o Deep Teal como cor de destaque para pastas e capas de documentos, transmitindo confiança institucional.
              </p>
              <button className="flex items-center gap-3 bg-[#0D3335] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#1A5F60] transition-colors group shadow-xl shadow-[#0D3335]/20">
                <Download size={20} className="group-hover:translate-y-1 transition-transform" />
                DOWNLOAD BRAND ASSETS
              </button>
            </div>
          </div>
        </div>

      </main>

      <footer className="bg-[#0D3335] text-white py-24 px-8 text-center">
        <IZIPISLogo variant="principal" color="monochrome-white" className="mb-12 opacity-50 scale-75" />
        <div className="max-w-xl mx-auto space-y-6 opacity-40">
          <p className="text-xs font-bold uppercase tracking-[0.5em]">Identity Case &copy; 2026</p>
          <p className="text-sm italic">"Construindo o futuro da gestão de inventário com precisão e design."</p>
        </div>
      </footer>
    </div>
  );
}

function SectionNumber({ number, title }: { number: string, title: string }) {
  return (
    <div className="flex flex-col mb-12">
      <span className="text-[10rem] font-black leading-none text-[#0D3335]/[0.02] absolute left-0 -translate-x-1/2 -mt-24 pointer-events-none select-none">{number}</span>
      <div className="flex items-center gap-4 relative z-10">
        <span className="text-[#E87A5D] font-black text-xl">{number}.</span>
        <h2 className="text-4xl font-black text-[#0D3335] uppercase tracking-tighter">{title}</h2>
      </div>
      <div className="h-1 w-24 bg-[#E87A5D] mt-4" />
    </div>
  );
}

function ColorCard({ hex, name, usage, desc, text, border }: { hex: string, name: string, usage: string, desc: string, text: string, border?: boolean }) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className={`rounded-[2rem] overflow-hidden bg-white shadow-xl shadow-[#0D3335]/5 cursor-pointer ${border ? 'border border-[#0D3335]/10' : ''}`}
    >
      <div className="h-32 w-full flex items-center justify-center relative group" style={{ backgroundColor: hex }}>
        <span className="font-mono text-xs font-bold transition-opacity" style={{ color: text }}>{hex}</span>
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Download size={20} className="text-white" />
        </div>
      </div>
      <div className="p-6">
        <p className="text-[#0D3335] font-black text-lg leading-none mb-1">{name}</p>
        <p className="text-[#E87A5D] text-[10px] font-black uppercase tracking-widest mb-3">{usage}</p>
        <p className="text-xs opacity-50 font-medium">{desc}</p>
      </div>
    </motion.div>
  );
}

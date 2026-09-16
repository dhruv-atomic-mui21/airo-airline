import Link from 'next/link';
import { Plane, Headset, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-3xl w-full text-center space-y-8">
        
        <div className="space-y-4">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <Plane className="w-10 h-10" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tight">
            Airo CRM Demo
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience our next-generation customer support platform powered by Gemini. 
            Open the Customer view and Agent view in separate tabs to see real-time interaction and AI assistance.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-8">
          
          {/* Customer Persona Card */}
          <Link href="/customer" target="_blank" className="group">
            <div className="h-full bg-white rounded-2xl p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300 text-left flex flex-col">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                <Plane className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Customer View</h2>
              <p className="text-gray-600 mb-6 flex-1">
                Simulate a passenger interacting with the Airo AI Assistant. The AI uses the customer's profile to provide personalized responses.
              </p>
              <div className="flex items-center text-blue-600 font-medium group-hover:gap-2 transition-all">
                Launch Customer Portal <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>

          {/* Agent Persona Card */}
          <Link href="/agent" target="_blank" className="group">
            <div className="h-full bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-sm hover:shadow-xl hover:border-purple-500 transition-all duration-300 text-left flex flex-col">
              <div className="w-12 h-12 bg-slate-800 text-purple-400 rounded-xl flex items-center justify-center mb-6">
                <Headset className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Agent Workspace</h2>
              <p className="text-slate-300 mb-6 flex-1">
                Access the CRM dashboard as a human agent. View live chats, customer context, and use "Agent Assist" to generate AI responses.
              </p>
              <div className="flex items-center text-purple-400 font-medium group-hover:gap-2 transition-all">
                Launch Agent Workspace <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </Link>

        </div>
        
        <div className="pt-12 text-sm text-gray-500">
          <p>Instructions: Open both links in new tabs. Messages sent in one will appear in the other.</p>
        </div>
        
      </div>
    </div>
  );
}

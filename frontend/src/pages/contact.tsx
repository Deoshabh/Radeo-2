import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // In a real app, you would submit this data to your API
      // const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      // const response = await fetch(`${apiBaseUrl}/api/contact`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });
      
      // if (!response.ok) {
      //   throw new Error('Failed to submit form');
      // }
      
      // Simulate API call success
      setTimeout(() => {
        setSubmitSuccess(true);
        setIsSubmitting(false);
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      }, 1000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitError('Failed to submit form. Please try again later.');
      setIsSubmitting(false);
    }
  };
  
  return (
    <Layout title="Contact Us | Radeo">
      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative bg-blue-700">
          <div className="absolute inset-0">
            <img
              className="w-full h-full object-cover mix-blend-multiply"
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1490&q=80"
              alt="Customer service"
            />
            <div className="absolute inset-0 bg-blue-700 opacity-70"></div>
          </div>
          <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Get in Touch
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-xl text-blue-100 max-w-3xl"
            >
              Have questions, feedback, or need assistance? We're here to help. Reach out to our team and we'll get back to you as soon as possible.
            </motion.p>
          </div>
        </div>

        {/* Contact Form Section */}
        <div className="py-16 px-4 overflow-hidden sm:px-6 lg:px-8 lg:py-24">
          <div className="relative max-w-xl mx-auto">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Send us a message
              </h2>
              <p className="mt-4 text-lg leading-6 text-gray-500">
                Fill out the form below and our team will respond within 24 hours.
              </p>
            </div>
            
            {submitSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-12 bg-green-50 p-6 rounded-lg text-center"
              >
                <svg className="h-12 w-12 text-green-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <h3 className="mt-3 text-lg font-medium text-green-800">Message sent successfully!</h3>
                <p className="mt-2 text-green-700">
                  Thank you for reaching out. We'll get back to you as soon as possible.
                </p>
                <button
                  onClick={() => setSubmitSuccess(false)}
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Send another message
                </button>
              </motion.div>
            ) : (
              <div className="mt-12">
                {submitError && (
                  <div className="mb-6 bg-red-50 p-4 rounded-md">
                    <p className="text-red-700">{submitError}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-8">
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1">
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        name="subject"
                        id="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <div className="mt-1">
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="py-3 px-4 block w-full shadow-sm focus:ring-blue-500 focus:border-blue-500 border-gray-300 rounded-md"
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                        isSubmitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-extrabold text-gray-900 text-center">
                Other Ways to Reach Us
              </h2>
              
              <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="text-blue-600 mx-auto w-12 h-12 flex items-center justify-center rounded-md bg-blue-50">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Phone Support</h3>
                  <p className="mt-2 text-gray-500">
                    Call us Monday through Friday from 9am to 5pm EST.
                  </p>
                  <p className="mt-2 text-blue-600 font-medium">+1 (555) 123-4567</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6 text-center">
                  <div className="text-blue-600 mx-auto w-12 h-12 flex items-center justify-center rounded-md bg-blue-50">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Email</h3>
                  <p className="mt-2 text-gray-500">
                    Send us an email and we'll respond within 24 hours.
                  </p>
                  <p className="mt-2 text-blue-600 font-medium">support@radeo.com</p>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6 text-center sm:col-span-2 lg:col-span-1">
                  <div className="text-blue-600 mx-auto w-12 h-12 flex items-center justify-center rounded-md bg-blue-50">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Office</h3>
                  <p className="mt-2 text-gray-500">
                    123 Commerce Street<br />
                    Suite 500<br />
                    New York, NY 10001
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage; 
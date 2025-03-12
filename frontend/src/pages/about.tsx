import React from 'react';
import { motion } from 'framer-motion';
import Layout from '../components/Layout';

const AboutPage: React.FC = () => {
  return (
    <Layout title="About Us | Radeo">
      <div className="bg-white">
        {/* Hero Section */}
        <div className="relative bg-gray-900">
          <div className="absolute inset-0">
            <img
              className="w-full h-full object-cover"
              src="https://images.unsplash.com/photo-1521737852567-6949f3f9f2b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
              alt="Team working together"
            />
            <div className="absolute inset-0 bg-gray-900 opacity-70"></div>
          </div>
          <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              About Radeo
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-6 text-xl text-gray-300 max-w-3xl"
            >
              We're on a mission to redefine the online shopping experience with quality products, exceptional service, and a commitment to sustainability.
            </motion.p>
          </div>
        </div>

        {/* Our Story Section */}
        <div className="py-16 bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                  Our Story
                </h2>
                <p className="mt-4 text-lg text-gray-500">
                  Founded in 2020, Radeo began with a simple idea: create an online marketplace that puts customers first. What started as a small operation has grown into a thriving e-commerce platform offering thousands of products across multiple categories.
                </p>
                <p className="mt-4 text-lg text-gray-500">
                  Our founders, Jane and John Smith, recognized a gap in the market for a customer-centric shopping experience that combined quality products, competitive pricing, and exceptional service. Today, we serve customers worldwide and continue to expand our offerings while staying true to our core values.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mt-10 lg:mt-0"
              >
                <img
                  className="rounded-lg shadow-lg"
                  src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80"
                  alt="Team meeting"
                />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="py-16 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Our Values
              </h2>
              <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
                These core principles guide everything we do at Radeo.
              </p>
            </motion.div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="text-blue-600 mb-4">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Quality First</h3>
                <p className="mt-2 text-gray-500">
                  We rigorously vet all products to ensure they meet our high standards for quality, durability, and value.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="text-blue-600 mb-4">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Fair Pricing</h3>
                <p className="mt-2 text-gray-500">
                  We believe in transparent, competitive pricing without hidden fees or misleading discounts.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white rounded-lg shadow-md p-6"
              >
                <div className="text-blue-600 mb-4">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900">Sustainability</h3>
                <p className="mt-2 text-gray-500">
                  We're committed to reducing our environmental impact through eco-friendly packaging and sustainable business practices.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
                Meet Our Team
              </h2>
              <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
                The passionate individuals behind Radeo who work tirelessly to bring you the best shopping experience.
              </p>
            </motion.div>

            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Team Member 1 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-center"
              >
                <div className="relative mx-auto h-40 w-40 rounded-full overflow-hidden">
                  <img
                    className="h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60"
                    alt="Jane Smith"
                  />
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">Jane Smith</h3>
                <p className="text-blue-600">Co-Founder & CEO</p>
                <p className="mt-2 text-gray-500">
                  With over 15 years of retail experience, Jane leads our strategic vision and operations.
                </p>
              </motion.div>

              {/* Team Member 2 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-center"
              >
                <div className="relative mx-auto h-40 w-40 rounded-full overflow-hidden">
                  <img
                    className="h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60"
                    alt="John Smith"
                  />
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">John Smith</h3>
                <p className="text-blue-600">Co-Founder & CTO</p>
                <p className="mt-2 text-gray-500">
                  John oversees our technology infrastructure and digital innovation initiatives.
                </p>
              </motion.div>

              {/* Team Member 3 */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-center"
              >
                <div className="relative mx-auto h-40 w-40 rounded-full overflow-hidden">
                  <img
                    className="h-full w-full object-cover"
                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60"
                    alt="Michael Johnson"
                  />
                </div>
                <h3 className="mt-4 text-xl font-medium text-gray-900">Michael Johnson</h3>
                <p className="text-blue-600">Head of Customer Experience</p>
                <p className="mt-2 text-gray-500">
                  Michael ensures every customer interaction exceeds expectations.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-blue-700">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              <span className="block">Ready to get started?</span>
              <span className="block text-blue-200">Reach out to our team today.</span>
            </h2>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <div className="inline-flex rounded-md shadow">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50"
                >
                  Contact Us
                </a>
              </div>
              <div className="ml-3 inline-flex rounded-md shadow">
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage; 
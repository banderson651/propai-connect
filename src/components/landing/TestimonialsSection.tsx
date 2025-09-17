import { Quote } from 'lucide-react';

const testimonials = [
  {
    quote:
      'PropAI gave us a single source of truth for every lead and helped our team close 32% more deals in the first quarter.',
    name: 'Sofia Martinez',
    role: 'Managing Broker',
    company: 'Skyline Realty',
    image:
      'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote:
      'The AI scoring and automation workflows are a game changer. Our agents now focus on the right opportunities at the right time.',
    name: 'Caleb Johnson',
    role: 'Director of Sales',
    company: 'Prime Estates',
    image:
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=200&q=80',
  },
  {
    quote:
      'Implementation was seamless. PropAI integrates with our existing marketing stack and reporting has never been clearer.',
    name: 'Amelia Chen',
    role: 'VP Operations',
    company: 'Urban Edge Developments',
    image:
      'https://images.unsplash.com/photo-1524156868115-3e1df2c5a941?auto=format&fit=crop&w=200&q=80',
  },
];

export const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium text-sm mb-4">
            Customer Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Teams Who Close Faster With PropAI
          </h2>
          <p className="text-lg text-slate-600">
            Hear from real estate leaders who transformed their operations with automation and AI insights.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="relative h-full rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <Quote className="absolute -top-6 left-8 h-12 w-12 text-indigo-200" />
              <p className="text-slate-700 leading-relaxed mb-8">“{testimonial.quote}”</p>
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="h-12 w-12 rounded-full object-cover border border-white shadow-md"
                  loading="lazy"
                />
                <div>
                  <p className="font-semibold text-slate-900">{testimonial.name}</p>
                  <p className="text-sm text-slate-500">{testimonial.role}</p>
                  <p className="text-sm text-indigo-600 font-medium">{testimonial.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

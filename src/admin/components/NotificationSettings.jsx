import { motion } from "framer-motion";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  CalendarClock,
  CreditCard,
  Users,
  Wrench,
} from "lucide-react";
import { useState } from "react";

export default function NotificationSettings() {
  const [settings, setSettings] = useState({
    email: true,
    sms: false,
    push: true,
    bookings: true,
    payments: true,
    employees: false,
    services: true,
    system: true,
  });

  const toggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const notifications = [
    {
      key: "email",
      title: "Email Notifications",
      desc: "Receive important updates by email.",
      icon: Mail,
    },
    {
      key: "sms",
      title: "SMS Notifications",
      desc: "Receive booking alerts via SMS.",
      icon: MessageSquare,
    },
    {
      key: "push",
      title: "Push Notifications",
      desc: "Browser & mobile push notifications.",
      icon: Smartphone,
    },
    {
      key: "bookings",
      title: "Booking Alerts",
      desc: "Notify when a booking is created.",
      icon: CalendarClock,
    },
    {
      key: "payments",
      title: "Payment Alerts",
      desc: "Receive payment confirmations.",
      icon: CreditCard,
    },
    {
      key: "employees",
      title: "Employee Alerts",
      desc: "Attendance & employee updates.",
      icon: Users,
    },
    {
      key: "services",
      title: "Service Updates",
      desc: "Notify about service changes.",
      icon: Wrench,
    },
    {
      key: "system",
      title: "System Notifications",
      desc: "Important system announcements.",
      icon: Bell,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="rounded-3xl border border-slate-800 bg-[#111827] p-8 shadow-xl"
    >
      {/* Header */}

      <div className="mb-8 flex items-center gap-4">

        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-r from-yellow-500 to-orange-600">

          <Bell
            size={28}
            className="text-white"
          />

        </div>

        <div>

          <h2 className="text-2xl font-bold text-white">
            Notification Settings
          </h2>

          <p className="text-slate-400">
            Choose which notifications you want to receive.
          </p>

        </div>

      </div>

      <div className="grid gap-5 lg:grid-cols-2">

        {notifications.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900 p-5 transition hover:border-cyan-500"
            >
              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10">

                  <Icon
                    size={22}
                    className="text-cyan-400"
                  />

                </div>

                <div>

                  <h3 className="font-semibold text-white">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-400">
                    {item.desc}
                  </p>

                </div>

              </div>

              {/* Toggle */}

              <button
                onClick={() => toggle(item.key)}
                className={`relative h-8 w-16 rounded-full transition ${
                  settings[item.key]
                    ? "bg-cyan-500"
                    : "bg-slate-600"
                }`}
              >
                <span
                  className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                    settings[item.key]
                      ? "right-1"
                      : "left-1"
                  }`}
                ></span>
              </button>

            </div>
          );
        })}

      </div>

      {/* Footer */}

      <div className="mt-8 flex justify-end">

        <button className="rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 px-8 py-3 font-semibold text-white shadow-lg transition hover:scale-105">

          Save Notification Settings

        </button>

      </div>

    </motion.div>
  );
}
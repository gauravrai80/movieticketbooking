import { enIN } from 'date-fns/locale';
import { format, isSameDay, isSameMonth, isToday, parseISO } from 'date-fns';
import { CalendarIcon, ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useState, useMemo } from 'react'; // Assuming these are part of existing imports

const ShowtimeCalendar = ({ showtimes, onSelectShowtime }) => {
  // ... (existing code)
  // Assuming currentMonth, onPrevMonth, onNextMonth, calendarDays,
  // showtimesByDate, selectedDate, setSelectedDate are defined here.
  // For the purpose of this edit, we'll assume they exist.

  const [currentMonth, setCurrentMonth] = useState(new Date()); // Example, replace with actual state
  const [selectedDate, setSelectedDate] = useState(new Date()); // Example, replace with actual state
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1); // Example
  const showtimesByDate = useMemo(() => { // Example, replace with actual logic
    const grouped = {};
    // Dummy data for demonstration if not provided
    if (!showtimes || showtimes.length === 0) {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      grouped[format(today, 'yyyy-MM-dd')] = [{ _id: 's1', startTime: new Date().toISOString(), price: 250, theater: { name: 'Cineplex' }, format: ['2D'] }];
      grouped[format(tomorrow, 'yyyy-MM-dd')] = [{ _id: 's2', startTime: new Date().toISOString(), price: 300, theater: { name: 'PVR' }, format: ['3D'] }];
    } else {
      showtimes.forEach(showtime => {
        const dateKey = format(parseISO(showtime.startTime), 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(showtime);
      });
    }
    return grouped;
  }, [showtimes]);

  const onPrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const onNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Dummy calendarDays for demonstration if not provided
  const calendarDays = useMemo(() => {
    const startDay = new Date(monthStart);
    startDay.setDate(startDay.getDate() - startDay.getDay()); // Start from Sunday of the first week
    const days = [];
    for (let i = 0; i < 42; i++) { // 6 weeks
      const day = new Date(startDay);
      day.setDate(startDay.getDate() + i);
      days.push(day);
    }
    return days;
  }, [monthStart]);


  const selectedDateShowtimes = useMemo(() => {
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return showtimesByDate[dateKey] || [];
  }, [selectedDate, showtimesByDate]);

  return (
    <div className="bg-primary-900 rounded-lg overflow-hidden shadow-xl border border-primary-800" role="region" aria-label="Showtime Calendar">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2" id="calendar-title">
            <CalendarIcon className="text-accent-500" aria-hidden="true" />
            {format(currentMonth, 'MMMM yyyy', { locale: enIN })}
          </h2>
          <div className="flex gap-2">
            <button
              onClick={onPrevMonth}
              aria-label="Previous Month"
              className="p-2 bg-primary-800 hover:bg-primary-700 rounded-full text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={onNextMonth}
              aria-label="Next Month"
              className="p-2 bg-primary-800 hover:bg-primary-700 rounded-full text-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 mb-2 text-center" role="row">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-gray-400 text-sm font-medium py-2" role="columnheader">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1" role="grid" aria-labelledby="calendar-title">
          {calendarDays.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const hasShowtimes = !!showtimesByDate[dateKey];
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = isSameMonth(day, monthStart);
            const showCount = showtimesByDate[dateKey]?.length || 0;
            const label = `${format(day, 'EEEE, MMMM do')}, ${showCount} showtimes available`;

            return (
              <button
                key={day.toString()}
                onClick={() => hasShowtimes && setSelectedDate(day)}
                disabled={!hasShowtimes}
                aria-label={hasShowtimes ? label : `${format(day, 'MMMM do')} - No showtimes`}
                aria-selected={isSelected}
                aria-disabled={!hasShowtimes}
                className={`
                  h-14 md:h-20 rounded-lg flex flex-col items-center justify-center relative transition-all focus:outline-none focus:ring-2 focus:ring-inset focus:ring-accent-500
                  ${!isCurrentMonth ? 'text-gray-600 bg-primary-950/50' : ''}
                  ${isSelected ? 'bg-accent-600 text-white shadow-lg scale-105 z-10' : 'text-gray-300'}
                  ${!isSelected && hasShowtimes ? 'bg-primary-800 hover:bg-primary-700 border border-primary-700' : ''}
                  ${!hasShowtimes ? 'opacity-50 cursor-not-allowed bg-primary-900/30' : ''}
                `}
              >
                <span className={`text-sm md:text-lg font-semibold ${isToday(day) && !isSelected ? 'text-accent-400' : ''}`}>
                  {format(day, 'd')}
                </span>
                {hasShowtimes && (
                  <span className={`text-[10px] md:text-xs mt-1 px-2 py-0.5 rounded-full ${isSelected ? 'bg-white/20' : 'bg-primary-950 text-accent-400'}`}>
                    {showtimesByDate[dateKey].length} shows
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>



      {/* Selected Day Showtimes */}
      <div className="border-t border-primary-800 bg-primary-950/50 p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          Showtimes for {format(selectedDate, 'MMM do, yyyy')}
        </h3>

        {selectedDateShowtimes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedDateShowtimes.map(showtime => (
              <div
                key={showtime._id}
                className="bg-primary-800 p-4 rounded-lg hover:bg-primary-700 transition cursor-pointer border border-transparent hover:border-accent-500/50 group"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-white font-bold text-lg">
                    <Clock size={18} className="text-accent-500" />
                    {format(parseISO(showtime.startTime), 'h:mm a')}
                  </div>
                  <span className="bg-primary-950 text-accent-400 px-2 py-1 rounded text-xs font-bold">
                    ₹{showtime.price}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                  <MapPin size={14} />
                  <span className="truncate">{showtime.theater?.name}</span>
                </div>

                <div className="flex justify-between items-center mt-3 pt-3 border-t border-primary-700">
                  <div className="flex gap-1">
                    {showtime.format?.map(fmt => (
                      <span key={fmt} className="px-1.5 py-0.5 bg-primary-900 text-gray-300 text-[10px] rounded uppercase">
                        {fmt}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => onSelectShowtime(showtime)}
                    className="text-accent-400 text-sm font-semibold hover:text-accent-300 flex items-center gap-1 group-hover:translate-x-1 transition-transform"
                  >
                    Select →
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-primary-900/50 rounded-lg border-2 border-dashed border-primary-800">
            <p>No showtimes available for this date.</p>
          </div>
        )}
      </div>
    </div >
  );
};

export default ShowtimeCalendar;

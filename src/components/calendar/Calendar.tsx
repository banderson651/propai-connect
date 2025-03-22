import React, { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { CalendarEvent, CalendarService } from '@/services/calendar/calendarService';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { format } from 'date-fns';
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Tag } from 'lucide-react';

interface CalendarProps {
  onEventClick?: (event: CalendarEvent) => void;
}

export function Calendar({ onEventClick }: CalendarProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newEvent, setNewEvent] = useState<Partial<CalendarEvent>>({
    title: '',
    description: '',
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    all_day: false,
    location: '',
    color: '#3b82f6',
  });

  const calendarService = CalendarService.getInstance();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 2);

      const data = await calendarService.getEvents(startDate, endDate);
      setEvents(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load calendar events');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventClick = (info: any) => {
    const event = events.find(e => e.id === info.event.id);
    if (event) {
      setSelectedEvent(event);
      onEventClick?.(event);
    }
  };

  const handleEventDrop = async (info: any) => {
    try {
      const event = events.find(e => e.id === info.event.id);
      if (event) {
        await calendarService.updateEvent(event.id, {
          start_date: info.event.start.toISOString(),
          end_date: info.event.end?.toISOString(),
        });
        await loadEvents();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update event');
    }
  };

  const handleEventResize = async (info: any) => {
    try {
      const event = events.find(e => e.id === info.event.id);
      if (event) {
        await calendarService.updateEvent(event.id, {
          end_date: info.event.end.toISOString(),
        });
        await loadEvents();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update event');
    }
  };

  const handleCreateEvent = async () => {
    try {
      await calendarService.createEvent(newEvent as CalendarEventCreate);
      setIsCreateDialogOpen(false);
      setNewEvent({
        title: '',
        description: '',
        start_date: new Date().toISOString(),
        end_date: new Date().toISOString(),
        all_day: false,
        location: '',
        color: '#3b82f6',
      });
      await loadEvents();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create event');
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center h-96">Loading calendar...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 py-3 border-b">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Schedule</h2>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={newEvent.start_date?.slice(0, 16)}
                    onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={newEvent.end_date?.slice(0, 16)}
                    onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="all_day"
                  checked={newEvent.all_day}
                  onCheckedChange={(checked) => setNewEvent({ ...newEvent, all_day: checked })}
                />
                <Label htmlFor="all_day">All Day Event</Label>
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  type="color"
                  value={newEvent.color}
                  onChange={(e) => setNewEvent({ ...newEvent, color: e.target.value })}
                />
              </div>
              <Button onClick={handleCreateEvent} className="w-full">
                Create Event
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="mx-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="px-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events.map(event => ({
            id: event.id,
            title: event.title,
            start: event.start_date,
            end: event.end_date,
            allDay: event.all_day,
            backgroundColor: event.color,
            borderColor: event.color,
          }))}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          height="auto"
          contentHeight="auto"
          expandRows={true}
          stickyHeaderDates={true}
          dayMaxEvents={true}
          displayEventTime={!true}
          slotMinTime="06:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          nowIndicator={true}
          businessHours={{
            daysOfWeek: [1, 2, 3, 4, 5],
            startTime: '09:00',
            endTime: '17:00',
          }}
        />
      </div>

      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Description</h3>
              <p className="text-gray-600">{selectedEvent?.description || 'No description'}</p>
            </div>
            <div>
              <h3 className="font-medium">Date</h3>
              <p className="text-gray-600">
                {selectedEvent?.start_date && format(new Date(selectedEvent.start_date), 'PPP')}
                {selectedEvent?.end_date && ` - ${format(new Date(selectedEvent.end_date), 'PPP')}`}
              </p>
            </div>
            {selectedEvent?.location && (
              <div>
                <h3 className="font-medium">Location</h3>
                <p className="text-gray-600">{selectedEvent.location}</p>
              </div>
            )}
            {selectedEvent?.task_id && (
              <div>
                <h3 className="font-medium">Related Task</h3>
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => {
                    window.location.href = `/tasks/${selectedEvent.task_id}`;
                  }}
                >
                  View Task
                </Button>
              </div>
            )}
            {selectedEvent?.property_id && (
              <div>
                <h3 className="font-medium">Related Property</h3>
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => {
                    window.location.href = `/properties/${selectedEvent.property_id}`;
                  }}
                >
                  View Property
                </Button>
              </div>
            )}
            {selectedEvent?.contact_id && (
              <div>
                <h3 className="font-medium">Related Contact</h3>
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => {
                    window.location.href = `/contacts/${selectedEvent.contact_id}`;
                  }}
                >
                  View Contact
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
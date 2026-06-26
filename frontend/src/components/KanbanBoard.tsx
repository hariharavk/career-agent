import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import axios from "axios"
import { motion } from "framer-motion"
import { BriefcaseBusiness, Calendar, ExternalLink, MoreHorizontal } from "lucide-react"

export type Job = {
  id: number
  company: string
  title: string
  url: string
  status: string
  notes?: string
  created_at: string
  applied_at?: string
}

const COLUMNS = [
  { id: "NEW", title: "New Matches", color: "from-blue-500/20 to-cyan-500/10", border: "border-blue-500/20", badge: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { id: "APPLIED", title: "Applied", color: "from-indigo-500/20 to-purple-500/10", border: "border-indigo-500/20", badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  { id: "INTERVIEWING", title: "Interviewing", color: "from-amber-500/20 to-orange-500/10", border: "border-amber-500/20", badge: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
  { id: "REJECTED", title: "Archived", color: "from-zinc-500/20 to-zinc-600/10", border: "border-zinc-500/20", badge: "bg-zinc-800 text-zinc-400 border-zinc-700" }
]

export function KanbanBoard() {
  const [jobs, setJobs] = useState<Job[]>([])
  
  useEffect(() => {
    fetchJobs()
  }, [])
  
  const fetchJobs = async () => {
    try {
      const { data } = await axios.get("http://localhost:8000/api/jobs?limit=500")
      const mapped = data.map((j: Job) => ({...j, status: j.status || 'NEW'}))
      setJobs(mapped)
    } catch (e) {
      console.error(e)
    }
  }

  const onDragEnd = async (result: any) => {
    if (!result.destination) return
    const { source, destination, draggableId } = result
    if (source.droppableId === destination.droppableId) return

    const newStatus = destination.droppableId
    const jobId = parseInt(draggableId)
    
    // Optimistic UI update
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j))
    
    try {
      await axios.put(`http://localhost:8000/api/jobs/${jobId}`, { status: newStatus })
    } catch (e) {
      console.error("Failed to update status", e)
      fetchJobs() // revert on fail
    }
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full items-start">
        {COLUMNS.map((col, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            key={col.id} 
            className={`flex flex-col bg-zinc-900/40 backdrop-blur-md rounded-2xl border ${col.border} p-5 h-[calc(100vh-12rem)] shadow-xl relative overflow-hidden group`}
          >
            {/* Subtle Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-b ${col.color} opacity-30 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none`} />

            <div className="flex items-center justify-between mb-6 shrink-0 relative z-10">
              <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">{col.title}</h3>
              <Badge variant="outline" className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${col.badge}`}>
                {jobs.filter(j => j.status === col.id).length}
              </Badge>
            </div>
            
            <Droppable droppableId={col.id}>
              {(provided, snapshot) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef}
                  className={`flex-1 overflow-y-auto space-y-4 p-1 custom-scrollbar relative z-10 transition-colors duration-300 ${snapshot.isDraggingOver ? 'bg-white/5 rounded-xl' : ''}`}
                >
                  {jobs.filter(j => j.status === col.id).map((job, index) => (
                    <Draggable key={job.id} draggableId={job.id.toString()} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={provided.draggableProps.style}
                        >
                          <motion.div
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Card className={`bg-zinc-950/80 backdrop-blur-sm border-white/5 hover:border-white/20 transition-all duration-300 shadow-lg ${snapshot.isDragging ? 'ring-2 ring-indigo-500/50 shadow-indigo-500/20 z-50 rotate-2' : ''}`}>
                              <CardContent className="p-5">
                                <div className="flex justify-between items-start gap-3 mb-3">
                                  <div className="flex items-center gap-2 text-zinc-300 font-medium text-sm truncate flex-1">
                                    <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center shrink-0">
                                      <BriefcaseBusiness className="w-3.5 h-3.5 text-zinc-400" />
                                    </div>
                                    <span className="truncate" title={job.company}>{job.company}</span>
                                  </div>
                                  <a href={job.url} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors shrink-0">
                                    <ExternalLink className="w-4 h-4" />
                                  </a>
                                </div>
                                
                                <p className="text-sm font-semibold text-white leading-tight mb-4 line-clamp-2" title={job.title}>
                                  {job.title}
                                </p>
                                
                                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                  <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {format(new Date(job.created_at), 'MMM d')}
                                  </div>
                                  <button className="text-zinc-600 hover:text-zinc-300 transition-colors">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </motion.div>
        ))}
      </div>
    </DragDropContext>
  )
}

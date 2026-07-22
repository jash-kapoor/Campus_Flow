/**
 * Shuffles an array in place.
 * @param {Array} array The array to shuffle.
 */
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

/**
 * The main algorithm for generating timetables with advanced constraints.
 * - Dynamic lunch breaks after 12:00 (max 2 batches per slot).
 * - Prioritizes placing classes adjacently to reduce gaps.
 * - Subjects appear only once per day.
 * - Total theory classes per subject per week is 3.
 * - Ensures final output is sorted by time.
 */
export const generateTimetableAlgorithm = (batches, teachers, classrooms, labs) => {
    // --- CONFIGURATION ---
    const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri"];
    // This is the canonical, sorted list of time slots. It will NOT be modified.
    const sortedTimeSlots = ["09:00-10:00", "10:00-11:00", "11:00-12:00", "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00", "16:00-17:00"];
    const possibleLunchSlots = ["12:00-13:00", "13:00-14:00"];
    const THEORY_HOURS_PER_WEEK = 3;
    const LAB_SESSIONS_PER_WEEK = 1;

    // --- DATA PREPARATION ---
    const teacherSubjectMap = {};
    teachers.forEach(teacher => {
        teacher.subjects.forEach(subject => {
            teacherSubjectMap[subject] = teacher.name;
        });
    });

    const createEmptySchedule = (resources) => {
        const schedule = {};
        resources.forEach(resource => {
            schedule[resource] = {};
            weekdays.forEach(day => {
                schedule[resource][day] = {};
                sortedTimeSlots.forEach(slot => {
                    schedule[resource][day][slot] = null;
                });
            });
        });
        return schedule;
    };

    const teacherSchedules = createEmptySchedule(teachers.map(t => t.name));
    const classroomSchedules = createEmptySchedule(classrooms);
    const labSchedules = createEmptySchedule(labs);
    const batchSchedules = {};
    batches.forEach(batch => {
        batchSchedules[batch.name] = {};
        weekdays.forEach(day => {
            batchSchedules[batch.name][day] = {};
        });
    });
    
    // --- DYNAMIC LUNCH SCHEDULING ---
    const lunchSlotTracker = { "12:00-13:00": 0, "13:00-14:00": 0 };
    batches.forEach(batch => {
        let lunchScheduled = false;
        for (const lunchSlot of possibleLunchSlots) {
            if (lunchSlotTracker[lunchSlot] < 2) {
                weekdays.forEach(day => {
                    batchSchedules[batch.name][day][lunchSlot] = "LUNCH";
                });
                lunchSlotTracker[lunchSlot]++;
                lunchScheduled = true;
                break;
            }
        }
        if (!lunchScheduled) {
             weekdays.forEach(day => {
                batchSchedules[batch.name][day][possibleLunchSlots[0]] = "LUNCH";
            });
        }
    });

    // --- SCHEDULING LOGIC ---
    batches.forEach(batch => {
        const batchName = batch.name;
        const dailySubjectTracker = {};
        weekdays.forEach(day => dailySubjectTracker[day] = new Set());

        const allSubjectsForBatch = [...batch.subjects, ...batch.labs];
        shuffle(allSubjectsForBatch);

        allSubjectsForBatch.forEach(subjectName => {
            const isLab = subjectName.toLowerCase().includes('lab') || subjectName.toLowerCase().includes('workshop');
            const teacherName = teacherSubjectMap[subjectName] || "Not Available";
            const hoursToSchedule = isLab ? LAB_SESSIONS_PER_WEEK : THEORY_HOURS_PER_WEEK;

            for (let i = 0; i < hoursToSchedule; i++) {
                let bestSlot = null;
                let maxScore = -1;

                shuffle(weekdays);
                for (const day of weekdays) {
                    // --- FIX: Create a shuffled COPY of the time slots for random checking ---
                    const shuffledTimeSlots = [...sortedTimeSlots];
                    shuffle(shuffledTimeSlots);

                    for (const slot of shuffledTimeSlots) {
                        if (batchSchedules[batchName][day][slot]) continue;

                        let isValid = true;
                        let currentScore = 1;

                        if (dailySubjectTracker[day].has(subjectName)) isValid = false;
                        if (teacherName !== "Not Available" && teacherSchedules[teacherName][day][slot]) isValid = false;
                        
                        // Use the original sortedTimeSlots for chronological checks
                        const slotIndex = sortedTimeSlots.indexOf(slot);
                        if (slotIndex > 0 && batchSchedules[batchName][day][sortedTimeSlots[slotIndex - 1]]) currentScore += 10;
                        if (slotIndex < sortedTimeSlots.length - 1 && batchSchedules[batchName][day][sortedTimeSlots[slotIndex + 1]]) currentScore += 10;
                        
                        if (isLab) {
                            if (slotIndex >= sortedTimeSlots.length - 1 || batchSchedules[batchName][day][sortedTimeSlots[slotIndex + 1]]) isValid = false;
                            if (teacherName !== "Not Available" && teacherSchedules[teacherName][day][sortedTimeSlots[slotIndex + 1]]) isValid = false;
                        }

                        if (isValid && currentScore > maxScore) {
                            maxScore = currentScore;
                            bestSlot = { day, slot };
                        }
                    }
                }

                if (bestSlot) {
                    const { day, slot } = bestSlot;
                    let room = "N/A";
                    
                    if (isLab) {
                        // Use original sortedTimeSlots to find the correct next slot
                        const nextSlot = sortedTimeSlots[sortedTimeSlots.indexOf(slot) + 1];
                        for (const labRoom of labs) {
                            if (!labSchedules[labRoom][day][slot] && !labSchedules[labRoom][day][nextSlot]) {
                                room = labRoom;
                                break;
                            }
                        }
                        if (room !== "N/A") {
                            const details = { subject: subjectName, teacher: teacherName, room };
                            batchSchedules[batchName][day][slot] = details;
                            batchSchedules[batchName][day][nextSlot] = details;
                            dailySubjectTracker[day].add(subjectName);
                            labSchedules[room][day][slot] = { batch: batchName };
                            labSchedules[room][day][nextSlot] = { batch: batchName };
                            if (teacherName !== "Not Available") {
                                teacherSchedules[teacherName][day][slot] = { batch: batchName };
                                teacherSchedules[teacherName][day][nextSlot] = { batch: batchName };
                            }
                        }
                    } else {
                        for (const classroom of classrooms) {
                            if (!classroomSchedules[classroom][day][slot]) {
                                room = classroom;
                                break;
                            }
                        }
                        if (room !== "N/A") {
                            const details = { subject: subjectName, teacher: teacherName, room };
                            batchSchedules[batchName][day][slot] = details;
                            dailySubjectTracker[day].add(subjectName);
                            classroomSchedules[room][day][slot] = { batch: batchName };
                            if (teacherName !== "Not Available") {
                                teacherSchedules[teacherName][day][slot] = { batch: batchName };
                            }
                        }
                    }
                }
            }
        });
    });
    
    // --- FINAL SORTING STEP ---
    // This will now work correctly because it iterates over the original `sortedTimeSlots` array.
    const finalSchedules = {};
    for (const batchName in batchSchedules) {
        finalSchedules[batchName] = {};
        for (const day in batchSchedules[batchName]) {
            finalSchedules[batchName][day] = {};
            sortedTimeSlots.forEach(slot => {
                if (batchSchedules[batchName][day][slot]) {
                    finalSchedules[batchName][day][slot] = batchSchedules[batchName][day][slot];
                }
            });
        }
    }

    return finalSchedules;
};


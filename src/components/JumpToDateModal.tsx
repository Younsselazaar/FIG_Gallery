import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import Svg, { Path } from "react-native-svg";

import { light, brand } from "../theme/colors";
import { scale, fontScale } from "../theme/responsive";

const SCREEN_WIDTH = Dimensions.get("window").width;

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelectDate: (date: Date) => void;
};

type SelectionMode = "day" | "week";

function CloseIcon({ size = 24, color = light.textSecondary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M18 6L6 18M6 6l12 12"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ChevronLeftIcon({ size = 20, color = light.textSecondary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M15 18l-6-6 6-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ChevronRightIcon({ size = 20, color = light.textSecondary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M9 18l6-6-6-6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function JumpToDateModal({ visible, onClose, onSelectDate }: Props) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>("week");

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Get days from previous month
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const daysInPrevMonth = getDaysInMonth(prevYear, prevMonth);

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDatePress = (day: number, isCurrentMonth: boolean = true) => {
    let date: Date;
    if (isCurrentMonth) {
      date = new Date(currentYear, currentMonth, day);
    } else {
      return; // Don't select dates from other months
    }
    setSelectedDate(date);
    onSelectDate(date);
    onClose();
  };

  const isToday = (day: number): boolean => {
    return (
      day === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear()
    );
  };

  const isSelected = (day: number): boolean => {
    if (!selectedDate) return false;
    return (
      day === selectedDate.getDate() &&
      currentMonth === selectedDate.getMonth() &&
      currentYear === selectedDate.getFullYear()
    );
  };

  // Build calendar grid
  const calendarDays: { day: number; isCurrentMonth: boolean }[] = [];

  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true });
  }

  // Next month days
  const remainingDays = 42 - calendarDays.length; // 6 rows * 7 days
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false });
  }

  // Split into weeks
  const weeks: { day: number; isCurrentMonth: boolean }[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Jump to Date</Text>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <CloseIcon size={scale(22)} />
            </Pressable>
          </View>

          {/* Selection mode toggle */}
          <View style={styles.modeToggle}>
            <Pressable
              style={[
                styles.modeButton,
                selectionMode === "day" && styles.modeButtonActive,
              ]}
              onPress={() => setSelectionMode("day")}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  selectionMode === "day" && styles.modeButtonTextActive,
                ]}
              >
                Single Day
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.modeButton,
                selectionMode === "week" && styles.modeButtonActive,
              ]}
              onPress={() => setSelectionMode("week")}
            >
              <Text
                style={[
                  styles.modeButtonText,
                  selectionMode === "week" && styles.modeButtonTextActive,
                ]}
              >
                Whole Week
              </Text>
            </Pressable>
          </View>

          {/* Month navigation */}
          <View style={styles.monthNav}>
            <Pressable onPress={goToPrevMonth} style={styles.navButton}>
              <ChevronLeftIcon size={scale(20)} />
            </Pressable>
            <Text style={styles.monthText}>
              {MONTHS[currentMonth]} {currentYear}
            </Text>
            <Pressable onPress={goToNextMonth} style={styles.navButton}>
              <ChevronRightIcon size={scale(20)} />
            </Pressable>
          </View>

          {/* Day headers */}
          <View style={styles.dayHeaders}>
            {DAYS.map((day) => (
              <Text key={day} style={styles.dayHeader}>
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {weeks.map((week, weekIndex) => (
              <View key={weekIndex} style={styles.weekRow}>
                {week.map((dayInfo, dayIndex) => (
                  <Pressable
                    key={`${weekIndex}-${dayIndex}`}
                    style={[
                      styles.dayCell,
                      dayInfo.isCurrentMonth && isToday(dayInfo.day) && styles.todayCell,
                      dayInfo.isCurrentMonth && isSelected(dayInfo.day) && styles.selectedCell,
                    ]}
                    onPress={() => handleDatePress(dayInfo.day, dayInfo.isCurrentMonth)}
                    disabled={!dayInfo.isCurrentMonth}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !dayInfo.isCurrentMonth && styles.otherMonthText,
                        dayInfo.isCurrentMonth && isToday(dayInfo.day) && styles.todayText,
                        dayInfo.isCurrentMonth && isSelected(dayInfo.day) && styles.selectedText,
                      ]}
                    >
                      {dayInfo.day}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: SCREEN_WIDTH - scale(32),
    maxWidth: 400,
    backgroundColor: light.background,
    borderRadius: scale(16),
    padding: scale(20),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(16),
  },
  title: {
    fontSize: fontScale(20),
    fontWeight: "700",
    color: light.textPrimary,
  },
  closeButton: {
    padding: scale(4),
  },
  modeToggle: {
    flexDirection: "row",
    marginBottom: scale(20),
    gap: scale(10),
  },
  modeButton: {
    paddingVertical: scale(10),
    paddingHorizontal: scale(20),
    borderRadius: scale(24),
    borderWidth: 1,
    borderColor: light.border,
    backgroundColor: light.background,
  },
  modeButtonActive: {
    backgroundColor: brand.teal,
    borderColor: brand.teal,
  },
  modeButtonText: {
    fontSize: fontScale(14),
    fontWeight: "500",
    color: light.textSecondary,
  },
  modeButtonTextActive: {
    color: "#FFFFFF",
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: scale(16),
  },
  navButton: {
    width: scale(36),
    height: scale(36),
    borderRadius: scale(8),
    borderWidth: 1,
    borderColor: light.border,
    justifyContent: "center",
    alignItems: "center",
  },
  monthText: {
    fontSize: fontScale(16),
    fontWeight: "600",
    color: light.textPrimary,
  },
  dayHeaders: {
    flexDirection: "row",
    marginBottom: scale(8),
  },
  dayHeader: {
    flex: 1,
    textAlign: "center",
    fontSize: fontScale(13),
    fontWeight: "500",
    color: light.textSecondary,
  },
  calendarGrid: {
    gap: scale(4),
  },
  weekRow: {
    flexDirection: "row",
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: scale(8),
  },
  todayCell: {
    backgroundColor: light.surfaceSecondary,
  },
  selectedCell: {
    backgroundColor: brand.teal,
  },
  dayText: {
    fontSize: fontScale(15),
    fontWeight: "500",
    color: light.textPrimary,
  },
  otherMonthText: {
    color: light.textTertiary,
  },
  todayText: {
    fontWeight: "700",
  },
  selectedText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

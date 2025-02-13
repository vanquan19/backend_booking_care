import dayjs from "dayjs";

const generateDate = (month = dayjs().month(), year = dayjs().year(), ondays) => {
    const firstDateOfmonth = dayjs().year(year).month(month).startOf("month");
    const lastDateOfMonth = dayjs().year(year).month(month).endOf("month");
    const arrayOfDates = [];

    //create prefix dates
    for (let i = 0; i < firstDateOfmonth.day(); i++) {
        arrayOfDates.push({
            date: firstDateOfmonth.day(i),
            isCurrentMonth: false,
            isPrefixDate: true,
            isDateOfPreviousMonth: true,
        });
    }

    //generate dates for the current month
    for (let i = firstDateOfmonth.date(); i <= lastDateOfMonth.date(); i++) {
        arrayOfDates.push({
            date: firstDateOfmonth.date(i),
            isCurrentMonth: true,
            isPrefixDate: firstDateOfmonth.date(i).date() < dayjs().date() && firstDateOfmonth.date(i).month() === dayjs().month() && firstDateOfmonth.date(i).year() === dayjs().year(),
            today: firstDateOfmonth.date(i).toDate().toDateString() === dayjs().toDate().toDateString(),
        });
    }

    const remaining = 42 - arrayOfDates.length;
    for (let i = lastDateOfMonth.date() + 1; i <= lastDateOfMonth.date() + remaining; i++) {
        arrayOfDates.push({
            date: lastDateOfMonth.date(i),
            isCurrentMonth: false,
            isDateOfNextMonth: true,
        });
    }

    // add ondays
    ondays.forEach((onday) => {
        const ondayDate = dayjs(`${onday.year}-${onday.month}-${onday.date}`); // Sử dụng template string để kết hợp ngày, tháng, năm
        arrayOfDates.forEach((dateObj) => {
            if (ondayDate.isSame(dateObj.date, "day")) {
                dateObj.listProfile = onday.listProfile.split(",");
            }
        });
    });

    return arrayOfDates;
};

export const generateDateWithOffset = (month = dayjs().month(), year = dayjs().year(), offset = []) => {
    const firstDateOfmonth = dayjs().year(year).month(month).startOf("month");
    const lastDateOfMonth = dayjs().year(year).month(month).endOf("month");
    const arrayOfDates = [];

    //create prefix dates
    for (let i = 0; i < firstDateOfmonth.day(); i++) {
        arrayOfDates.push({
            date: firstDateOfmonth.day(i),
            isCurrentMonth: false,
            isPrefixDate: true,
            isDateOfPreviousMonth: true,
        });
    }

    //generate dates for the current month
    for (let i = firstDateOfmonth.date(); i <= lastDateOfMonth.date(); i++) {
        arrayOfDates.push({
            date: firstDateOfmonth.date(i),
            isCurrentMonth: true,
            isPrefixDate: firstDateOfmonth.date(i).date() < dayjs().date() && firstDateOfmonth.date(i).month() === dayjs().month() && firstDateOfmonth.date(i).year() === dayjs().year(),
            today: firstDateOfmonth.date(i).toDate().toDateString() === dayjs().toDate().toDateString(),
        });
    }

    const remaining = 42 - arrayOfDates.length;
    for (let i = lastDateOfMonth.date() + 1; i <= lastDateOfMonth.date() + remaining; i++) {
        arrayOfDates.push({
            date: lastDateOfMonth.date(i),
            isCurrentMonth: false,
            isDateOfNextMonth: true,
        });
    }

    // if date in offset include include in arrayOfDates => add listTimeOff
    arrayOfDates.forEach((dateObj) => {
        const listTime = ["08:00 - 09:30", "10:00 - 11:30", "14:00 - 15:30", "16:00 - 17:30"];
        const filteredListTime = listTime.filter((time) => {
            return !offset.some((item) => {
                const offsetDate = dayjs(`${item.year}-${item.month}-${item.date}`);
                return offsetDate.isSame(dateObj.date, "day") && item.time === time;
            });
        });

        //remove list time previous 30 minutes in current date
        if (dateObj.today) {
            const currentTime = dayjs();
            const thresholdTime = currentTime.subtract(30, "minute");

            const filteredByTime = filteredListTime.filter((time) => {
                const timeSplit = time.split(" - ");
                const startTime = dayjs(`${dateObj.date.format("YYYY-MM-DD")} ${timeSplit[0]}`);
                return startTime.isAfter(thresholdTime);
            });

            dateObj.listTime = filteredByTime;
        } else dateObj.listTime = filteredListTime;
    });

    return arrayOfDates;
};

export default generateDate;

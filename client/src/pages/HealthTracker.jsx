import React, { useState, useContext } from "react";
import { useTranslation } from "react-i18next";
import { AppContext } from "../context/AppContext";
import Header from "../components/Header";

function HealthTracker() {
  const { t } = useTranslation();
  const {
    medicationList,
    addMedication,
    removeMedication,
    symptomLogs,
    addSymptomLog,
    removeSymptomLog,
  } = useContext(AppContext);

  const [activeTab, setActiveTab] = useState("medications");
  const [medForm, setMedForm] = useState({
    name: "",
    dosage: "",
    frequency: "",
    time: "",
    notes: "",
  });

  const [symptomForm, setSymptomForm] = useState({
    symptom: "",
    severity: "3",
    notes: "",
  });

  const handleMedChange = (e) => {
    setMedForm({ ...medForm, [e.target.name]: e.target.value });
  };

  const handleSymptomChange = (e) => {
    setSymptomForm({ ...symptomForm, [e.target.name]: e.target.value });
  };

  const handleAddMedication = (e) => {
    e.preventDefault();
    if (!medForm.name || !medForm.dosage || !medForm.frequency || !medForm.time) {
      alert(t("healthTracker.fillRequiredMedication"));
      return;
    }

    addMedication({
      id: Date.now(),
      ...medForm,
      createdAt: new Date().toISOString(),
    });

    setMedForm({ name: "", dosage: "", frequency: "", time: "", notes: "" });
  };

  const handleAddSymptom = (e) => {
    e.preventDefault();
    if (!symptomForm.symptom) {
      alert(t("healthTracker.fillSymptom"));
      return;
    }

    addSymptomLog({
      id: Date.now(),
      symptom: symptomForm.symptom,
      severity: symptomForm.severity,
      notes: symptomForm.notes,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    });

    setSymptomForm({ symptom: "", severity: "3", notes: "" });
  };

  return (
    <div style={styles.pageContainer}>
      <Header />
      <div style={styles.contentContainer}>
<h1 style={styles.pageTitle}>{t("healthTracker.title")}</h1>
      <p style={styles.pageSubtitle}>
        {t("healthTracker.subtitle")}
        </p>

        <div style={styles.tabGroup}>
          <button
            type="button"
            onClick={() => setActiveTab("medications")}
            style={activeTab === "medications" ? styles.activeTab : styles.tabButton}
          >
            {t("healthTracker.medicationTab")}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("symptoms")}
            style={activeTab === "symptoms" ? styles.activeTab : styles.tabButton}
          >
            {t("healthTracker.symptomsTab")}
          </button>
        </div>

        {activeTab === "medications" ? (
          <div style={styles.panel}>
            <div style={styles.formCard}>
              <h2 style={styles.sectionTitle}>{t("healthTracker.addMedication")}</h2>
              <form onSubmit={handleAddMedication} style={styles.form}>
                <input
                  name="name"
                  placeholder={t("healthTracker.medicationName")}
                  value={medForm.name}
                  onChange={handleMedChange}
                  style={styles.input}
                />
                <input
                  name="dosage"
                  placeholder={t("healthTracker.dosage")}
                  value={medForm.dosage}
                  onChange={handleMedChange}
                  style={styles.input}
                />
                <input
                  name="frequency"
                  placeholder={t("healthTracker.frequency")}
                  value={medForm.frequency}
                  onChange={handleMedChange}
                  style={styles.input}
                />
                <input
                  name="time"
                  placeholder={t("healthTracker.bestTime")}
                  value={medForm.time}
                  onChange={handleMedChange}
                  style={styles.input}
                />
                <textarea
                  name="notes"
                  placeholder={t("healthTracker.notesOptional")}
                  value={medForm.notes}
                  onChange={handleMedChange}
                  style={styles.textarea}
                />
                <button type="submit" style={styles.primaryButton}>
                  {t("healthTracker.saveMedication")}
                </button>
              </form>
            </div>

            <div style={styles.listCard}>
              <h2 style={styles.sectionTitle}>{t("healthTracker.medicationList")}</h2>
              {medicationList.length === 0 ? (
                <p style={styles.emptyText}>{t("healthTracker.noMedications")}</p>
              ) : (
                medicationList.map((med) => (
                  <div key={med.id} style={styles.listItem}>
                    <div>
                      <p style={styles.listItemTitle}>{med.name}</p>
                      <p style={styles.listItemMeta}>{med.dosage} · {med.frequency} · {med.time}</p>
                      {med.notes && <p style={styles.listItemNotes}>{med.notes}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeMedication(med.id)}
                      style={styles.smallButton}
                    >
                      {t("healthTracker.remove")}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div style={styles.panel}>
            <div style={styles.formCard}>
              <h2 style={styles.sectionTitle}>{t("healthTracker.logSymptom")}</h2>
              <form onSubmit={handleAddSymptom} style={styles.form}>
                <input
                  name="symptom"
                  placeholder={t("healthTracker.symptomDescription")}
                  value={symptomForm.symptom}
                  onChange={handleSymptomChange}
                  style={styles.input}
                />
                <label style={styles.label}>
                  {t("healthTracker.severity")}: {symptomForm.severity}
                  <input
                    type="range"
                    name="severity"
                    min="1"
                    max="5"
                    value={symptomForm.severity}
                    onChange={handleSymptomChange}
                    style={styles.range}
                  />
                </label>
                <textarea
                  name="notes"
                  placeholder={t("healthTracker.notesOrTrigger")}
                  value={symptomForm.notes}
                  onChange={handleSymptomChange}
                  style={styles.textarea}
                />
                <button type="submit" style={styles.primaryButton}>
                  {t("healthTracker.logSymptomButton")}
                </button>
              </form>
            </div>

            <div style={styles.listCard}>
              <h2 style={styles.sectionTitle}>{t("healthTracker.symptomHistory")}</h2>
              {symptomLogs.length === 0 ? (
                <p style={styles.emptyText}>{t("healthTracker.noSymptoms")}</p>
              ) : (
                symptomLogs.map((log) => (
                  <div key={log.id} style={styles.listItem}>
                    <div>
                      <p style={styles.listItemTitle}>{log.symptom}</p>
                      <p style={styles.listItemMeta}>Severity {log.severity} · {log.date} at {log.time}</p>
                      {log.notes && <p style={styles.listItemNotes}>{log.notes}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSymptomLog(log.id)}
                      style={styles.smallButton}
                    >
                      {t("healthTracker.remove")}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: "100vh",
    background: "#f8fafc",
  },
  contentContainer: {
    maxWidth: "1040px",
    margin: "0 auto",
    padding: "30px 20px 60px",
  },
  pageTitle: {
    fontSize: "32px",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "10px",
  },
  pageSubtitle: {
    color: "#4b5563",
    marginBottom: "24px",
    lineHeight: 1.7,
  },
  tabGroup: {
    display: "flex",
    gap: "12px",
    marginBottom: "24px",
    flexWrap: "wrap",
  },
  tabButton: {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "1px solid #d1d5db",
    background: "#ffffff",
    color: "#374151",
    cursor: "pointer",
    fontWeight: 600,
  },
  activeTab: {
    padding: "12px 20px",
    borderRadius: "10px",
    border: "1px solid #2563eb",
    background: "#eff6ff",
    color: "#1d4ed8",
    cursor: "pointer",
    fontWeight: 700,
  },
  panel: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: "24px",
  },
  formCard: {
    background: "#ffffff",
    padding: "26px",
    borderRadius: "20px",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
  },
  listCard: {
    background: "#ffffff",
    padding: "26px",
    borderRadius: "20px",
    boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)",
    minHeight: "320px",
  },
  sectionTitle: {
    fontSize: "22px",
    fontWeight: 700,
    marginBottom: "18px",
    color: "#111827",
  },
  form: {
    display: "grid",
    gap: "16px",
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    outline: "none",
    fontSize: "15px",
  },
  textarea: {
    width: "100%",
    minHeight: "110px",
    borderRadius: "12px",
    border: "1px solid #d1d5db",
    padding: "14px 16px",
    outline: "none",
    resize: "vertical",
    fontSize: "15px",
  },
  label: {
    color: "#374151",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    fontWeight: 600,
    fontSize: "14px",
  },
  range: {
    width: "100%",
  },
  primaryButton: {
    marginTop: "10px",
    padding: "14px 22px",
    borderRadius: "12px",
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: 700,
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    alignItems: "flex-start",
    padding: "18px",
    borderRadius: "14px",
    border: "1px solid #e5e7eb",
    marginBottom: "14px",
    background: "#fafafa",
  },
  listItemTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    color: "#111827",
  },
  listItemMeta: {
    margin: "8px 0 0",
    color: "#6b7280",
    fontSize: "14px",
  },
  listItemNotes: {
    margin: "10px 0 0",
    color: "#4b5563",
    fontSize: "14px",
  },
  emptyText: {
    color: "#6b7280",
    fontSize: "15px",
  },
  smallButton: {
    border: "none",
    background: "#ef4444",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "10px 14px",
    cursor: "pointer",
    fontWeight: 600,
  },
};

export default HealthTracker;

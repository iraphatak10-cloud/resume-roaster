const CLICHES = [
  [/\bteam player\b/i, "team player"],
  [/\bhard[- ]?working\b/i, "hardworking"],
  [/\bdetail[- ]oriented\b/i, "detail-oriented"],
  [/\bpassionate\b/i, "passionate"],
  [/\bgo[- ]getter\b/i, "go-getter"],
  [/\bsynergy\b/i, "synergy"],
  [/\bresults[- ]driven\b/i, "results-driven"],
  [/\bself[- ]starter\b/i, "self-starter"],
  [/\bthink outside the box\b/i, "thinking outside the box"],
  [/\bresponsible for\b/i, "responsible for"],
  [/\bduties included\b/i, "duties included"],
  [/\bworked on\b/i, "worked on"],
  [/\bhelped (with|to)\b/i, "helped with"],
  [/\bvarious\b/i, "various"],
  [/\betc\.?\b/i, "etc."]
];

const SECTIONS = [
  { name: "experience", re: /\b(experience|employment|work history)\b/i },
  { name: "education", re: /\b(education|university|college|bachelor|master|degree|b\.?\s?tech|b\.?\s?e\b)\b/i },
  { name: "projects", re: /\bprojects?\b/i },
  { name: "skills", re: /\b(skills|technologies|tech stack|tools)\b/i }
];

const METRIC_RE =
  /(\b\d+(\.\d+)?\s?%|\$\s?\d|\b\d{2,}\b|\b(increased|reduced|decreased|grew|saved|cut|improved|launched|shipped)\b)/gi;

const ACTION_RE =
  /\b(built|led|designed|implemented|launched|shipped|reduced|increased|automated|owned|migrated|optimized|created|developed|analyzed|deployed|refactored|negotiated|published)\b/gi;

function unique(values) {
  return [...new Set(values)];
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function findCliches(text) {
  return unique(
    CLICHES.filter(([pattern]) => pattern.test(text)).map(([, label]) => label)
  );
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

function analyzeResume(resume) {
  const text = resume.replace(/\s+/g, " ").trim();
  const lines = resume.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const presentSections = SECTIONS.filter((section) => section.re.test(text)).map(
    (section) => section.name
  );
  const missingSections = SECTIONS.filter(
    (section) => !presentSections.includes(section.name)
  ).map((section) => section.name);

  const cliches = findCliches(text);
  const metricCount = countMatches(text, METRIC_RE);
  const actionCount = countMatches(text, ACTION_RE);
  const bulletCount = lines.filter((line) => /^[-•*–]/.test(line)).length;
  const hasEmail = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text);
  const hasLink = /https?:\/\/|linkedin\.com|github\.com/i.test(text);

  let score = 34;
  score += presentSections.length * 8;
  score += Math.min(metricCount, 5) * 5;
  score += Math.min(actionCount, 6) * 2;
  score += bulletCount >= 3 ? 6 : bulletCount > 0 ? 3 : 0;
  score += hasEmail ? 3 : 0;
  score += hasLink ? 3 : 0;

  if (wordCount < 80) score -= 18;
  else if (wordCount < 150) score -= 8;
  else if (wordCount > 900) score -= 6;
  else score += 6;

  score -= Math.min(cliches.length, 4) * 4;
  if (metricCount === 0) score -= 10;
  if (actionCount === 0) score -= 6;

  score = clamp(score, 8, 94);

  return {
    score,
    roast: writeRoast({
      score,
      wordCount,
      cliches,
      metricCount,
      actionCount,
      missingSections,
      bulletCount
    }),
    suggestions: writeSuggestions({
      wordCount,
      cliches,
      metricCount,
      actionCount,
      missingSections,
      bulletCount,
      hasEmail,
      hasLink
    }),
    signals: {
      wordCount,
      sections: presentSections,
      missingSections,
      cliches,
      metricCount,
      actionCount
    }
  };
}

function writeRoast({
  score,
  wordCount,
  cliches,
  metricCount,
  actionCount,
  missingSections,
  bulletCount
}) {
  const lines = [];

  if (score >= 80) {
    lines.push(
      "Okay, relax, this one is actually decent. You brought receipts. I came here to bully a resume and you made it awkward."
    );
  } else if (score >= 60) {
    lines.push(
      "This is the resume equivalent of saying \"I'm funny\" and then waiting. The shape is fine. The proof dipped out."
    );
  } else if (wordCount < 80) {
    lines.push(
      "You really sent this. A recruiter asked for a career and you handed them a fortune cookie."
    );
  } else {
    lines.push(
      "You wrote this like the job was already yours. It is not. This is a list of things that happened near you."
    );
  }

  if (metricCount === 0) {
    lines.push(
      "Not a single number. No users, no money, no hours saved. You want to be believed on vibes, and vibes are unemployed."
    );
  } else if (metricCount < 2) {
    lines.push(
      "One number wandered in, got scared, and left. That is not impact. That is a cameo in your own career."
    );
  }

  if (cliches.length > 0) {
    const quoted = cliches.slice(0, 3).map((phrase) => `“${phrase}”`).join(", ");
    lines.push(
      `And then you said ${quoted}. Be serious. That is the copy-paste voice of someone who has never met a consequence.`
    );
  } else if (actionCount === 0) {
    lines.push(
      "Your verbs are hiding. Nothing was built, shipped, or fixed. The work just happened in your general vicinity, like weather."
    );
  }

  if (missingSections.includes("projects") && missingSections.includes("experience")) {
    lines.push(
      "No experience section. No projects. You submitted the concept of a resume and expected a round of applause."
    );
  } else if (bulletCount === 0 && wordCount > 120) {
    lines.push(
      "Also, this is a paragraph with ambition. Nobody is reading your novella. They have forty other tabs and a will to live."
    );
  }

  if (score < 40) {
    lines.push("I'm not mad. I'm just impressed you thought this would survive contact with another human.");
  } else if (score < 70) {
    lines.push("Fix it before a stranger with a coffee and twelve seconds does this to you for real.");
  }

  return lines.join(" ");
}

function writeSuggestions({
  wordCount,
  cliches,
  metricCount,
  actionCount,
  missingSections,
  bulletCount,
  hasEmail,
  hasLink
}) {
  const suggestions = [];

  if (metricCount < 3) {
    suggestions.push(
      "Add a number. Percent, money, users, hours. \"I helped\" is not a plot twist. Give the reader something they can picture."
    );
  }

  if (cliches.length > 0) {
    suggestions.push(
      `Retire ${cliches
        .slice(0, 3)
        .map((phrase) => `“${phrase}”`)
        .join(", ")}. You did not invent those phrases and they are not helping you. Say the actual task.`
    );
  }

  if (actionCount < 3) {
    suggestions.push(
      "Open with a verb that did something: built, shipped, cut, led, automated. \"Responsible for\" just means you had a chair."
    );
  }

  if (missingSections.length > 0) {
    suggestions.push(
      `Add ${missingSections.join(", ")}. Right now those chapters are missing and the reader will assume you are too.`
    );
  }

  if (bulletCount < 3 && wordCount > 100) {
    suggestions.push(
      "Stop writing paragraphs at a recruiter. Bullets. Action, tool, result. Their attention span left the chat."
    );
  }

  if (wordCount < 120) {
    suggestions.push(
      "This is shorter than your food order. Name the tools, the scope, and one thing that changed because you showed up."
    );
  } else if (wordCount > 900) {
    suggestions.push(
      "This is not a memoir. Cut it down to the last few years and the lines with a result. Length is not a personality."
    );
  }

  if (!hasEmail) {
    suggestions.push(
      "Put an email at the top. Otherwise this is a poster about you, and posters do not get interviews."
    );
  } else if (!hasLink) {
    suggestions.push(
      "Drop a link. GitHub, a portfolio, anything alive. Right now we are taking your word for it, which is adorable."
    );
  }

  if (suggestions.length < 3) {
    suggestions.push(
      "Lead with the result, not the job title. The first line should be the sentence someone would repeat in a meeting about you."
    );
    suggestions.push(
      "Write for the job you actually want. A cool skill that doesn't match the role is just you showing off in the wrong room."
    );
  }

  return suggestions.slice(0, 4);
}

module.exports = { analyzeResume };

/**
 * Fallback FAQ content, used until the client's Supabase project is populated.
 *
 * Kept in step with `supabase/seed.sql` — same questions, same answers. The
 * duplication is deliberate: the site has to be readable and useful before a
 * database exists, and the FAQs are load-bearing enough that an empty state
 * would be worse than a duplicated source.
 */

export type FaqGroup = {
  category: string;
  items: { question: string; answer: string }[];
};

export const fallbackFaqs: FaqGroup[] = [
  {
    category: "Health testing",
    items: [
      {
        question: "What exactly do you test the parents for?",
        answer:
          "Hips and elbows scored by the OFA at two years or older, an annual CAER eye examination by a veterinary ophthalmologist, and a full breed DNA panel. Every certificate is published on that dog's own page, and you are welcome to look them up yourself on the OFA website using the registry number.",
      },
      {
        question: "What happens if a dog does not pass?",
        answer:
          "They are spayed or neutered and they stay here as a family dog, or they go to a pet home we know. They are not bred from, and we do not sell them on as breeding stock to somebody else.",
      },
      {
        question: "Can I see the certificates before I commit?",
        answer:
          "Yes, and you should. They are on the site. If any breeder is reluctant to show you the paperwork, that reluctance is the answer to your question.",
      },
    ],
  },
  {
    category: "Applying",
    items: [
      {
        question: "How does the application work?",
        answer:
          "You answer about fifteen minutes of questions on this site. Nothing is paid here — when you finish, the form hands your answers to us on WhatsApp so you can send them in one tap, and we carry on from there. We read every application and we reply to every application, including the ones we cannot help.",
      },
      {
        question: "Do I have to pay a deposit to be on the list?",
        answer:
          "Not through this website. We take no payment online at all. If we agree on a puppy, we will talk about a deposit directly, and we will tell you exactly what it covers and when it is refundable before you send anything.",
      },
      {
        question: "How long is the wait?",
        answer:
          "It depends on the litter and on what you are after. We would rather tell you eight months and be right than tell you eight weeks and keep you hoping. Ask us and we will give you the honest number.",
      },
    ],
  },
  {
    category: "Bringing a puppy home",
    items: [
      {
        question: "How old are they when they leave?",
        answer:
          "Eight weeks, and not a day earlier. The weeks between six and eight are where a puppy learns to be a dog from its mother and its litter, and shortening that costs the dog something it does not get back.",
      },
      {
        question: "What comes with the puppy?",
        answer:
          "A folder with the registration paperwork, the vaccination and worming record, both parents' clearances, the microchip number, the health guarantee, four weeks of insurance, the food they are already eating, and a blanket that smells like their litter.",
      },
      {
        question: "Can you deliver, or do I collect?",
        answer:
          "You are welcome to collect, and most people do. We deliver ourselves within about four hours' drive, or we can arrange a flight nanny who carries the puppy in the cabin. Puppies do not travel as cargo.",
      },
    ],
  },
  {
    category: "After they are home",
    items: [
      {
        question: "What if my circumstances change?",
        answer:
          "We take the dog back. At eight weeks or at eight years, for any reason, with no questions and no fee. It is written into the contract. No Golden Pup dog ends up in a shelter while we are alive to prevent it.",
      },
      {
        question: "What does the health guarantee actually cover?",
        answer:
          "The full text is on the guarantee page rather than summarised here, because a warranty you have only read a summary of is not much use. Read it before you apply, and ask us about anything in it you do not like.",
      },
    ],
  },
];
